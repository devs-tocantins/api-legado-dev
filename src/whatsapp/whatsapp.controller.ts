import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { WhatsappService, WhatsappStatus } from './whatsapp.service';

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
}
