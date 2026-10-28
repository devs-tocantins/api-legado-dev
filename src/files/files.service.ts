import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { FileRepository } from './infrastructure/persistence/file.repository';
import { FileType } from './domain/file';
import { NullableType } from '../utils/types/nullable.type';
import { AllConfigType } from '../config/config.type';
import { FileDriver } from './config/file-config.type';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  create(data: FileType): Promise<FileType> {
    return this.fileRepository.create(data);
  }

  findById(id: FileType['id']): Promise<NullableType<FileType>> {
    return this.fileRepository.findById(id);
  }

  findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    return this.fileRepository.findByIds(ids);
  }

  findByPath(path: string): Promise<NullableType<FileType>> {
    return this.fileRepository.findByPath(path);
  }

  /** Extrai a chave de storage de uma URL completa (assinada ou pública). */
  extractStoragePath(urlOrKey: string): string {
    if (!/^https?:\/\//i.test(urlOrKey)) return urlOrKey;
    try {
      const { pathname } = new URL(urlOrKey);
      // URLs S3 path-style vêm como /{bucket}/{key} — o bucket não faz
      // parte da path armazenada no registro de file, então é descartado.
      const bucket = this.configService.get('file.awsDefaultS3Bucket', {
        infer: true,
      });
      const decoded = decodeURIComponent(pathname.replace(/^\//, ''));
      return bucket && decoded.startsWith(`${bucket}/`)
        ? decoded.slice(bucket.length + 1)
        : decoded;
    } catch {
      return urlOrKey;
    }
  }

  /**
   * Remove o arquivo de storage referenciado por uma URL (proofUrl de
   * submissão, por ex.), resolvendo a URL para o registro de file
   * correspondente primeiro. Best-effort: nunca lança — só loga em caso de
   * falha, pra nunca quebrar o fluxo que chamou (review/cancel de
   * submissão), que já efetivou a mudança principal antes de chamar isto.
   */
  async removeByUrl(urlOrKey: string | null | undefined): Promise<void> {
    if (!urlOrKey) return;
    try {
      const path = this.extractStoragePath(urlOrKey);
      const file = await this.findByPath(path);
      if (!file) {
        this.logger.warn(`Nenhum arquivo encontrado para a path "${path}"`);
        return;
      }
      await this.remove(file.id);
    } catch (err) {
      this.logger.warn(
        `Falha ao remover arquivo pela URL "${urlOrKey}": ${err}`,
      );
    }
  }

  /**
   * Deletes a file both from the database and from the underlying storage
   * (when using an S3-compatible driver). Safe to call with an id that no
   * longer exists — it just becomes a no-op.
   */
  async remove(id: FileType['id']): Promise<void> {
    const file = await this.fileRepository.findById(id);
    if (!file) return;

    const driver = this.configService.get('file.driver', { infer: true });

    if (driver === FileDriver.S3 || driver === FileDriver.S3_PRESIGNED) {
      try {
        const s3 = new S3Client({
          region: this.configService.get('file.awsS3Region', {
            infer: true,
          }),
          endpoint: this.configService.get('file.awsS3Endpoint', {
            infer: true,
          }),
          forcePathStyle: true,
          credentials: {
            accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
              infer: true,
            }),
            secretAccessKey: this.configService.getOrThrow(
              'file.secretAccessKey',
              { infer: true },
            ),
          },
        });

        await s3.send(
          new DeleteObjectCommand({
            Bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
              infer: true,
            }),
            Key: file.path,
          }),
        );
      } catch (error) {
        // Não impede a operação principal (ex: troca de foto) caso a
        // exclusão no storage falhe — só loga para investigação manual.
        this.logger.warn(
          `Falha ao remover arquivo "${file.path}" do storage: ${error}`,
        );
      }
    }

    await this.fileRepository.remove(id);
  }
}
