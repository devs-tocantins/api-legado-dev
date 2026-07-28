import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferenceDto } from './dto/update-preference.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('all') all?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    const allBoolean = all === 'true';
    return this.notificationsService.findForUser(
      req.user.id,
      pageNumber,
      limitNumber,
      allBoolean,
    );
  }

  @Get('unread-count')
  unreadCount(@Request() req) {
    return this.notificationsService
      .countUnread(req.user.id)
      .then((count) => ({ count }));
  }

  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markRead(id, req.user.id);
  }

  @Get('preferences')
  getPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  updatePreferences(
    @Request() req,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationsService.updatePreferences(req.user.id, dto);
  }
}
