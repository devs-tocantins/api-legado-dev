import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsAndReports1776700000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'SUBMISSION_APPROVED',
        'MISSION_WON',
        'SUBMISSION_REJECTED',
        'CONTRIBUTION_REPORT_UPHELD',
        'CONTRIBUTION_REPORT_RECEIVED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notification" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" integer NOT NULL,
        "type" notification_type_enum NOT NULL,
        "title" varchar NOT NULL,
        "body" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "relatedId" varchar DEFAULT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notification_userId" ON "notification" ("userId")
    `);

    await queryRunner.query(`
      CREATE TABLE "notification_preference" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" integer NOT NULL UNIQUE,
        "emailOnSubmissionApproved" boolean NOT NULL DEFAULT true,
        "emailOnMissionWon" boolean NOT NULL DEFAULT true
      )
    `);

    await queryRunner.query(`
      CREATE TYPE contribution_report_status_enum AS ENUM (
        'PENDING', 'DISMISSED', 'UPHELD'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "contribution_report" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "submissionId" uuid NOT NULL,
        "reporterProfileId" uuid NOT NULL,
        "reason" text NOT NULL,
        "proofUrl" varchar DEFAULT NULL,
        "status" contribution_report_status_enum NOT NULL DEFAULT 'PENDING',
        "adminNote" text DEFAULT NULL,
        "reviewedBy" integer DEFAULT NULL,
        "reviewedAt" TIMESTAMP DEFAULT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_report_submission_reporter" UNIQUE ("submissionId", "reporterProfileId")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "contribution_report"`);
    await queryRunner.query(`DROP TYPE contribution_report_status_enum`);
    await queryRunner.query(`DROP TABLE "notification_preference"`);
    await queryRunner.query(`DROP INDEX "IDX_notification_userId"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE notification_type_enum`);
  }
}
