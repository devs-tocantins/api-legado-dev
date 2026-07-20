import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrackSuggestion1784304600012 implements MigrationInterface {
  name = 'CreateTrackSuggestion1784304600012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."track_suggestion_status_enum" AS ENUM('PENDING', 'REVIEWED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "track_suggestion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "trackId" uuid, "title" character varying, "message" text NOT NULL, "status" "public"."track_suggestion_status_enum" NOT NULL DEFAULT 'PENDING', "reviewedByProfileId" uuid, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_track_suggestion_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_suggestion_profileId" ON "track_suggestion" ("profileId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_suggestion_trackId" ON "track_suggestion" ("trackId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_suggestion_status" ON "track_suggestion" ("status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_track_suggestion_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_track_suggestion_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_track_suggestion_reviewedByProfileId" FOREIGN KEY ("reviewedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "track_suggestion"`);
    await queryRunner.query(
      `DROP TYPE "public"."track_suggestion_status_enum"`,
    );
  }
}
