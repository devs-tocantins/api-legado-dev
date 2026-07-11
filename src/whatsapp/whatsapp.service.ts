import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { rm } from 'fs/promises';
import type { WASocket } from 'baileys';
import { AllConfigType } from '../config/config.type';

export type WhatsappStatus =
  | 'disabled'
  | 'disconnected'
  | 'connecting'
  | 'waiting_for_scan'
  | 'connected';

// baileys is ESM-only; this project builds to CommonJS. A static or plain
// `await import()` gets rewritten by tsc into a `require()` call, which
// throws ERR_REQUIRE_ESM at runtime. Hiding the import behind `new Function`
// keeps tsc from touching it, so the emitted JS keeps a real dynamic import().
const importEsm = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<any>;

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private sock: WASocket | null = null;
  private status: WhatsappStatus = 'disabled';
  private currentQr: string | null = null;
  private sendQueue: Promise<void> = Promise.resolve();

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async onModuleInit() {
    if (!this.configService.getOrThrow('whatsapp.enabled', { infer: true })) {
      this.status = 'disabled';
      return;
    }
    this.status = 'disconnected';
    await this.connect();
  }

  onModuleDestroy() {
    void this.sock?.end(undefined);
  }

  getStatus(): WhatsappStatus {
    return this.status;
  }

  async getQrDataUrl(): Promise<string | null> {
    if (!this.currentQr) return null;
    const QRCode = (await import('qrcode')).default;
    return QRCode.toDataURL(this.currentQr);
  }

  async logout(): Promise<void> {
    try {
      await this.sock?.logout();
    } catch (error) {
      this.logger.warn(`Erro ao encerrar sessão do WhatsApp: ${error}`);
    }
    await rm(this.sessionPath(), { recursive: true, force: true });
    this.currentQr = null;
    await this.connect();
  }

  sendText(e164Phone: string, message: string): Promise<void> {
    this.sendQueue = this.sendQueue
      .then(async () => {
        if (this.status !== 'connected' || !this.sock) return;
        const jid = `${e164Phone.replace(/\D/g, '')}@s.whatsapp.net`;
        await this.sock.sendMessage(jid, { text: message });
        await this.sleep(this.randomDelayMs());
      })
      .catch((error) => {
        this.logger.error(`Falha ao enviar mensagem via WhatsApp: ${error}`);
      });
    return this.sendQueue;
  }

  // Usado pelo endpoint de teste do admin: ao contrario de sendText (que
  // engole erros de proposito, pois e disparado em segundo plano por
  // gatilhos automaticos), aqui o erro real precisa subir pro chamador
  // para que o admin saiba se a mensagem de fato foi enviada ou nao.
  async sendTestMessage(e164Phone: string, message: string): Promise<void> {
    if (this.status !== 'connected' || !this.sock) {
      throw new Error('WhatsApp nao esta conectado.');
    }
    const jid = `${e164Phone.replace(/\D/g, '')}@s.whatsapp.net`;
    await this.sock.sendMessage(jid, { text: message });
  }

  private sessionPath(): string {
    return this.configService.getOrThrow('whatsapp.sessionPath', {
      infer: true,
    });
  }

  private randomDelayMs(): number {
    const min = this.configService.getOrThrow('whatsapp.sendMinDelayMs', {
      infer: true,
    });
    const max = this.configService.getOrThrow('whatsapp.sendMaxDelayMs', {
      infer: true,
    });
    return min + Math.floor(Math.random() * Math.max(0, max - min));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async connect(): Promise<void> {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      fetchLatestBaileysVersion,
      DisconnectReason,
    } = await importEsm('baileys');
    const pino = (await import('pino')).default;

    const { state, saveCreds } = await useMultiFileAuthState(
      this.sessionPath(),
    );
    const { version } = await fetchLatestBaileysVersion();

    this.status = 'connecting';
    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
    });
    this.sock = sock;

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update: any) =>
      this.handleConnectionUpdate(update, DisconnectReason),
    );
  }

  private handleConnectionUpdate(
    update: { connection?: string; lastDisconnect?: any; qr?: string },
    DisconnectReason: { loggedOut: number },
  ): void {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.currentQr = qr;
      this.status = 'waiting_for_scan';
    }

    if (connection === 'open') {
      this.status = 'connected';
      this.currentQr = null;
      this.logger.log('Conectado ao WhatsApp.');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      this.status = 'disconnected';
      this.currentQr = null;

      if (loggedOut) {
        this.logger.warn(
          'Sessão do WhatsApp desconectada (logout). É necessário escanear o QR novamente via /admin/logout.',
        );
        return;
      }

      this.logger.warn('Conexão com o WhatsApp caiu, reconectando...');
      void this.connect();
    }
  }
}
