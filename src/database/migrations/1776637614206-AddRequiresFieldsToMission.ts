import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiresFieldsToMission1776637614206
  implements MigrationInterface
{
  name = 'AddRequiresFieldsToMission1776637614206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mission_submission" DROP CONSTRAINT "FK_mission_submission_mission"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_notification_userId"`);
    await queryRunner.query(
      `ALTER TABLE "mission_submission" DROP CONSTRAINT "UQ_mission_submission_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contribution_report" DROP CONSTRAINT "UQ_report_submission_reporter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "requiresProof" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "requiresDescription" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" ADD CONSTRAINT "FK_2747f390542d85c30f86a0f2d9f" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" ADD CONSTRAINT "FK_1cb8bca775940a52071f1da35b8" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" ADD CONSTRAINT "FK_e169877bdc7e15a5ef5d71e028c" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mission_submission" DROP CONSTRAINT "FK_e169877bdc7e15a5ef5d71e028c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" DROP CONSTRAINT "FK_1cb8bca775940a52071f1da35b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" DROP CONSTRAINT "FK_2747f390542d85c30f86a0f2d9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "requiresDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "requiresProof"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contribution_report" ADD CONSTRAINT "UQ_report_submission_reporter" UNIQUE ("reporterProfileId", "submissionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" ADD CONSTRAINT "UQ_mission_submission_profile" UNIQUE ("missionId", "profileId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_userId" ON "notification" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "mission_submission" ADD CONSTRAINT "FK_mission_submission_mission" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
