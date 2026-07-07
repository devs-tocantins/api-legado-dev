import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotificationEntity } from './infrastructure/persistence/relational/entities/notification.entity';
import { NotificationPreferenceEntity } from './infrastructure/persistence/relational/entities/notification-preference.entity';
import { NotificationType } from './domain/notification-type.enum';
import { UpdateNotificationPreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class NotificationsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(data: {
    userId: number;
    type: NotificationType;
    title: string;
    body: string;
    relatedId?: string;
  }) {
    const repo = this.dataSource.getRepository(NotificationEntity);
    const notification = repo.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      relatedId: data.relatedId ?? null,
    });
    return repo.save(notification);
  }

  async findForUser(userId: number) {
    return this.dataSource.getRepository(NotificationEntity).find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async countUnread(userId: number) {
    return this.dataSource
      .getRepository(NotificationEntity)
      .count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: number) {
    await this.dataSource
      .getRepository(NotificationEntity)
      .update({ id, userId }, { isRead: true });
  }

  async markAllRead(userId: number) {
    await this.dataSource
      .getRepository(NotificationEntity)
      .update({ userId, isRead: false }, { isRead: true });
  }

  async getPreferences(userId: number): Promise<NotificationPreferenceEntity> {
    const repo = this.dataSource.getRepository(NotificationPreferenceEntity);
    let prefs = await repo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = await repo.save(repo.create({ userId }));
    }
    return prefs;
  }

  async updatePreferences(
    userId: number,
    dto: UpdateNotificationPreferenceDto,
  ) {
    const prefs = await this.getPreferences(userId);
    Object.assign(prefs, dto);
    return this.dataSource
      .getRepository(NotificationPreferenceEntity)
      .save(prefs);
  }
}
