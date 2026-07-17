import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrackEnrollmentAndCompletion1784304600003
  implements MigrationInterface
{
  name = 'CreateTrackEnrollmentAndCompletion1784304600003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // track_enrollment
    await queryRunner.query(
      `CREATE TYPE "public"."track_enrollment_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'ABANDONED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "track_enrollment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackId" uuid NOT NULL, "profileId" uuid NOT NULL, "status" "public"."track_enrollment_status_enum" NOT NULL DEFAULT 'ACTIVE', "startedAt" TIMESTAMP NOT NULL, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_track_enrollment_trackId_profileId" UNIQUE ("trackId", "profileId"), CONSTRAINT "PK_track_enrollment_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_enrollment_profileId" ON "track_enrollment" ("profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "FK_track_enrollment_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "FK_track_enrollment_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // track_item_completion
    await queryRunner.query(
      `CREATE TYPE "public"."track_item_completion_status_enum" AS ENUM('COMPLETED', 'SKIPPED_TESTOUT', 'IN_REVIEW')`,
    );
    await queryRunner.query(
      `CREATE TABLE "track_item_completion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "itemId" uuid NOT NULL, "profileId" uuid NOT NULL, "status" "public"."track_item_completion_status_enum" NOT NULL DEFAULT 'COMPLETED', "submissionId" uuid, "awardedJourneyXp" integer NOT NULL DEFAULT 0, "completedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_track_item_completion_itemId_profileId" UNIQUE ("itemId", "profileId"), CONSTRAINT "PK_track_item_completion_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_item_completion_profileId" ON "track_item_completion" ("profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_track_item_completion_itemId" FOREIGN KEY ("itemId") REFERENCES "track_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_track_item_completion_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_track_item_completion_submissionId" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_track_item_completion_submissionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_track_item_completion_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_track_item_completion_itemId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_item_completion_profileId"`,
    );
    await queryRunner.query(`DROP TABLE "track_item_completion"`);
    await queryRunner.query(
      `DROP TYPE "public"."track_item_completion_status_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "FK_track_enrollment_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "FK_track_enrollment_trackId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_enrollment_profileId"`,
    );
    await queryRunner.query(`DROP TABLE "track_enrollment"`);
    await queryRunner.query(
      `DROP TYPE "public"."track_enrollment_status_enum"`,
    );
  }
}
