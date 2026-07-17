import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLearningTrackSectionItem1784304600002
  implements MigrationInterface
{
  name = 'CreateLearningTrackSectionItem1784304600002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // learning_track
    await queryRunner.query(
      `CREATE TYPE "public"."learning_track_tier_enum" AS ENUM('ALICERCE', 'PILAR', 'ARCO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."learning_track_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "learning_track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "area" character varying NOT NULL, "tier" "public"."learning_track_tier_enum" NOT NULL, "status" "public"."learning_track_status_enum" NOT NULL DEFAULT 'DRAFT', "requiresTrackId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_learning_track_slug" UNIQUE ("slug"), CONSTRAINT "PK_learning_track_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_learning_track_requiresTrackId" FOREIGN KEY ("requiresTrackId") REFERENCES "learning_track"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // track_section
    await queryRunner.query(
      `CREATE TYPE "public"."track_section_status_enum" AS ENUM('ACTIVE', 'ARCHIVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "track_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackId" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "position" double precision NOT NULL, "status" "public"."track_section_status_enum" NOT NULL DEFAULT 'ACTIVE', "badgeId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_track_section_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_section_trackId" ON "track_section" ("trackId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" ADD CONSTRAINT "FK_track_section_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" ADD CONSTRAINT "FK_track_section_badgeId" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // track_item
    await queryRunner.query(
      `CREATE TYPE "public"."track_item_type_enum" AS ENUM('RESOURCE', 'TEXT', 'PROOF', 'COURSE_COMPLETION', 'EVENT', 'MISSION', 'CHECKPOINT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."track_item_status_enum" AS ENUM('ACTIVE', 'ARCHIVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "track_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackId" uuid NOT NULL, "sectionId" uuid NOT NULL, "type" "public"."track_item_type_enum" NOT NULL, "title" character varying NOT NULL, "body" text, "position" double precision NOT NULL, "status" "public"."track_item_status_enum" NOT NULL DEFAULT 'ACTIVE', "isOptional" boolean NOT NULL DEFAULT false, "allowsTestOut" boolean NOT NULL DEFAULT false, "journeyXp" integer NOT NULL DEFAULT 0, "grantsCommunityXp" boolean NOT NULL DEFAULT false, "activityId" uuid, "missionId" uuid, "courseId" uuid, "config" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_track_item_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_item_trackId" ON "track_item" ("trackId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_item_sectionId" ON "track_item" ("sectionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_sectionId" FOREIGN KEY ("sectionId") REFERENCES "track_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_activityId" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_missionId" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_courseId" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_courseId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_missionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_activityId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_sectionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_trackId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_track_item_sectionId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_track_item_trackId"`);
    await queryRunner.query(`DROP TABLE "track_item"`);
    await queryRunner.query(`DROP TYPE "public"."track_item_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."track_item_type_enum"`);

    await queryRunner.query(
      `ALTER TABLE "track_section" DROP CONSTRAINT "FK_track_section_badgeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" DROP CONSTRAINT "FK_track_section_trackId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_track_section_trackId"`);
    await queryRunner.query(`DROP TABLE "track_section"`);
    await queryRunner.query(`DROP TYPE "public"."track_section_status_enum"`);

    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_learning_track_requiresTrackId"`,
    );
    await queryRunner.query(`DROP TABLE "learning_track"`);
    await queryRunner.query(`DROP TYPE "public"."learning_track_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."learning_track_tier_enum"`);
  }
}
