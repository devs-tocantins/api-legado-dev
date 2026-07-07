import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContributionReportStatus {
  PENDING = 'PENDING',
  DISMISSED = 'DISMISSED',
  UPHELD = 'UPHELD',
}

@Entity({ name: 'contribution_report' })
export class ContributionReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({ type: 'uuid' })
  reporterProfileId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  proofUrl: string | null;

  @Column({
    type: 'enum',
    enum: ContributionReportStatus,
    default: ContributionReportStatus.PENDING,
  })
  status: ContributionReportStatus;

  @Column({ type: 'text', nullable: true, default: null })
  adminNote: string | null;

  @Column({ type: 'int', nullable: true, default: null })
  reviewedBy: number | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
