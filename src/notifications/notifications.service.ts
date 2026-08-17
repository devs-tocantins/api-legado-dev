import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotificationEntity } from './infrastructure/persistence/relational/entities/notification.entity';
import { NotificationPreferenceEntity } from './infrastructure/persistence/relational/entities/notification-preference.entity';
import { NotificationType } from './domain/notification-type.enum';
import { UpdateNotificationPreferenceDto } from './dto/update-preference.dto';

// Notificações lidas somem da lista depois desse período — não precisam
// ficar visíveis pra sempre, só as não-lidas (ou lidas recentemente).
const READ_NOTIFICATION_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class NotificationsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(data: {
    userId: number;
    type: NotificationType;
    title: string;
    body: string;
    relatedId?: string;
    payload?: Record<string, unknown>;
    link?: string;
  }) {
    const repo = this.dataSource.getRepository(NotificationEntity);
    const notification = repo.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      relatedId: data.relatedId ?? null,
      payload: data.payload ?? null,
      link: data.link ?? null,
    });
    return repo.save(notification);
  }

  async findForUser(
    userId: number,
    page: number = 1,
    limit: number = 50,
    all: boolean = false,
  ) {
    const cutoff = new Date(Date.now() - READ_NOTIFICATION_RETENTION_MS);
    const query = this.dataSource
      .getRepository(NotificationEntity)
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (!all) {
      query.andWhere(
        '(notification.isRead = false OR (notification.readAt IS NOT NULL AND notification.readAt >= :cutoff))',
        { cutoff },
      );
    }

    return query
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async countUnread(userId: number) {
    return this.dataSource
      .getRepository(NotificationEntity)
      .count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: number) {
    await this.dataSource
      .getRepository(NotificationEntity)
      .update({ id, userId }, { isRead: true, readAt: new Date() });
  }

  async markAllRead(userId: number) {
    await this.dataSource
      .getRepository(NotificationEntity)
      .update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
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
