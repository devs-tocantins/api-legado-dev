import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'gamification_profile',
})
export class GamificationProfileEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  userId: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'int', default: 0 })
  totalXp: number;

  @Column({ type: 'int', default: 0 })
  currentMonthlyXp: number;

  @Column({ type: 'int', default: 0 })
  currentYearlyXp: number;

  @Column({ type: 'int', default: 0 })
  gratitudeTokens: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
