import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEvent1782938889823 implements MigrationInterface {
  name = 'CreateEvent1782938889823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_category_enum" AS ENUM('MEETUP', 'WORKSHOP', 'HACKATHON', 'PALESTRA', 'CURSO', 'OUTRO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_modality_enum" AS ENUM('ONLINE', 'PRESENCIAL', 'HIBRIDO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(150) NOT NULL, "description" text NOT NULL, "category" "public"."event_category_enum" NOT NULL, "modality" "public"."event_modality_enum" NOT NULL, "startAt" TIMESTAMP NOT NULL, "endAt" TIMESTAMP, "location" character varying, "onlineUrl" character varying, "externalUrl" character varying, "status" "public"."event_status_enum" NOT NULL DEFAULT 'PENDING', "rejectionReason" text, "organizerId" integer NOT NULL, "reviewerId" integer, "reviewedAt" TIMESTAMP, "coverImageId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_event_coverImageId" UNIQUE ("coverImageId"), CONSTRAINT "PK_event_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_event_status_startAt" ON "event" ("status", "startAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_event_organizerId" FOREIGN KEY ("organizerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_event_reviewerId" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_event_coverImageId" FOREIGN KEY ("coverImageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_event_coverImageId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_event_reviewerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_event_organizerId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_event_status_startAt"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TYPE "public"."event_modality_enum"`);
    await queryRunner.query(`DROP TYPE "public"."event_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."event_status_enum"`);
  }
}
