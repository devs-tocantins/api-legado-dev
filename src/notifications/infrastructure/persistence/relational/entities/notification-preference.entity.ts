import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notification_preference' })
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  userId: number;

  @Column({ type: 'boolean', default: true })
  emailOnSubmissionApproved: boolean;

  @Column({ type: 'boolean', default: true })
  emailOnMissionWon: boolean;
}
