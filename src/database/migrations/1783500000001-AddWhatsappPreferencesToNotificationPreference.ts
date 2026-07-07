import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhatsappPreferencesToNotificationPreference1783500000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_preference" ADD COLUMN IF NOT EXISTS "whatsappOnSubmissionApproved" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" ADD COLUMN IF NOT EXISTS "whatsappOnMissionWon" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" ADD COLUMN IF NOT EXISTS "whatsappOnEventChanges" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_preference" DROP COLUMN IF EXISTS "whatsappOnEventChanges"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" DROP COLUMN IF EXISTS "whatsappOnMissionWon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" DROP COLUMN IF EXISTS "whatsappOnSubmissionApproved"`,
    );
  }
}
