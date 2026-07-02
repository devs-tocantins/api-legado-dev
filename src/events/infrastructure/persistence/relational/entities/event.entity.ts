import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { EventStatus } from '../../../../domain/event-status.enum';
import { EventCategory } from '../../../../domain/event-category.enum';
import { EventModality } from '../../../../domain/event-modality.enum';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity({
  name: 'event',
})
@Index(['status', 'startAt'])
export class EventEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EventCategory,
  })
  category: EventCategory;

  @Column({
    type: 'enum',
    enum: EventModality,
  })
  modality: EventModality;

  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  endAt: Date | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  location: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  onlineUrl: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  externalUrl: string | null;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column({ type: 'text', nullable: true, default: null })
  rejectionReason: string | null;

  @Column({ type: 'int' })
  organizerId: number;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'organizerId' })
  organizer: UserEntity;

  @Column({ type: 'int', nullable: true, default: null })
  reviewerId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: UserEntity | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reviewedAt: Date | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  coverImageId: string | null;

  @OneToOne(() => FileEntity, { eager: true })
  @JoinColumn({ name: 'coverImageId' })
  coverImage: FileEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
