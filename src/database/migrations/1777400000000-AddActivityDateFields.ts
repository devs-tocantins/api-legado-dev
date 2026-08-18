import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityDateFields1777400000000 implements MigrationInterface {
  name = 'AddActivityDateFields1777400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "requiresActivityDate" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "activityDate" TIMESTAMP DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'NEW_SUBMISSION_PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "activityDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "requiresActivityDate"`,
    );
  }
}
