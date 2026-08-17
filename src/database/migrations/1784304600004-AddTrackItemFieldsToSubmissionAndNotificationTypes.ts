import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackItemFieldsToSubmissionAndNotificationTypes1784304600004
  implements MigrationInterface
{
  name = 'AddTrackItemFieldsToSubmissionAndNotificationTypes1784304600004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "submission" ADD "trackItemId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "isTestOut" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_submission_trackItemId" FOREIGN KEY ("trackItemId") REFERENCES "track_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS 'TRACK_MILESTONE_APPROVED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS 'TRACK_BADGE_GRANTED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_submission_trackItemId"`,
    );
    await queryRunner.query(`ALTER TABLE "submission" DROP COLUMN "isTestOut"`);
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "trackItemId"`,
    );
    // Postgres does not support removing enum values; down() intentionally
    // leaves TRACK_MILESTONE_APPROVED/TRACK_BADGE_GRANTED in the type.
  }
}
