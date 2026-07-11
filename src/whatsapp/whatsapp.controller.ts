import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { WhatsappService, WhatsappStatus } from './whatsapp.service';
import { SendTestMessageDto } from './dto/send-test-message.dto';

@ApiTags('Whatsapp')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.admin)
@Controller({
  path: 'whatsapp/admin',
  version: '1',
})
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  @ApiOkResponse({ schema: { properties: { status: { type: 'string' } } } })
  getStatus(): { status: WhatsappStatus } {
    return { status: this.whatsappService.getStatus() };
  }

  @Get('qrcode')
  @ApiOkResponse({ schema: { properties: { qr: { type: 'string' } } } })
  async getQrCode(): Promise<{ qr: string | null }> {
    return { qr: await this.whatsappService.getQrDataUrl() };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(): Promise<void> {
    await this.whatsappService.logout();
  }

  @Post('send-test')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendTest(@Body() dto: SendTestMessageDto): Promise<void> {
    if (this.whatsappService.getStatus() !== 'connected') {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { whatsapp: 'notConnected' },
      });
    }

    const digits = dto.phone.replace(/\D/g, '');
    // Numero brasileiro sem o codigo do pais (DDD + numero, 10 ou 11 digitos)
    const e164Phone =
      digits.length <= 11 && !digits.startsWith('55') ? `55${digits}` : digits;

    await this.whatsappService.sendText(e164Phone, dto.message);
  }
}
