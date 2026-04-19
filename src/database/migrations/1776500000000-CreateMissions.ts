import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissions1776500000000 implements MigrationInterface {
  name = 'CreateMissions1776500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."mission_status_enum" AS ENUM('OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "mission" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "requirements" text,
        "xpReward" integer NOT NULL,
        "status" "public"."mission_status_enum" NOT NULL DEFAULT 'OPEN',
        "winnerId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mission" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."mission_submission_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "mission_submission" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "missionId" uuid NOT NULL,
        "profileId" uuid NOT NULL,
        "proofUrl" character varying,
        "description" text,
        "status" "public"."mission_submission_status_enum" NOT NULL DEFAULT 'PENDING',
        "feedback" text,
        "awardedXp" integer NOT NULL DEFAULT 0,
        "reviewerId" integer,
        "reviewedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mission_submission" PRIMARY KEY ("id"),
        CONSTRAINT "FK_mission_submission_mission" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_mission_submission_profile" UNIQUE ("missionId", "profileId")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "mission_submission"`);
    await queryRunner.query(
      `DROP TYPE "public"."mission_submission_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "mission"`);
    await queryRunner.query(`DROP TYPE "public"."mission_status_enum"`);
  }
}
