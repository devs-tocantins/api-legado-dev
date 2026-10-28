import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectTeams1787200000000 implements MigrationInterface {
  name = 'CreateProjectTeams1787200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const value of [
      'PROJECT_IDEA_APPROVED',
      'PROJECT_IDEA_REJECTED',
      'PROJECT_IDEA_INTEREST',
      'PROJECT_TEAM_MEMBER_ADDED',
    ]) {
      await queryRunner.query(
        `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS '${value}'`,
      );
    }

    await queryRunner.query(
      `CREATE TYPE "public"."project_role_enum" AS ENUM('FRONTEND', 'BACKEND', 'DATABASE', 'REQUIREMENTS_ANALYST', 'UX_DESIGNER', 'QA', 'DEVOPS', 'MOBILE', 'PROJECT_MANAGER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_idea_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'TEAM_FORMED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_team_status_enum" AS ENUM('RECRUITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`,
    );

    await queryRunner.query(
      `CREATE TABLE "project_idea" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(150) NOT NULL, "description" text NOT NULL, "tags" character varying array NOT NULL DEFAULT '{}', "status" "public"."project_idea_status_enum" NOT NULL DEFAULT 'PENDING', "rejectionReason" text, "authorId" integer NOT NULL, "reviewerId" integer, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_project_idea_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_project_idea_status_createdAt" ON "project_idea" ("status", "createdAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea" ADD CONSTRAINT "FK_project_idea_authorId" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea" ADD CONSTRAINT "FK_project_idea_reviewerId" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "project_idea_interest" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ideaId" uuid NOT NULL, "userId" integer NOT NULL, "role" "public"."project_role_enum" NOT NULL, "message" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_project_idea_interest_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_project_idea_interest_ideaId_userId" ON "project_idea_interest" ("ideaId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea_interest" ADD CONSTRAINT "FK_project_idea_interest_ideaId" FOREIGN KEY ("ideaId") REFERENCES "project_idea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea_interest" ADD CONSTRAINT "FK_project_idea_interest_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "project_team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ideaId" uuid NOT NULL, "name" character varying(150) NOT NULL, "description" text, "status" "public"."project_team_status_enum" NOT NULL DEFAULT 'RECRUITING', "repoUrl" character varying, "ownerId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_project_team_ideaId" UNIQUE ("ideaId"), CONSTRAINT "PK_project_team_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_team" ADD CONSTRAINT "FK_project_team_ideaId" FOREIGN KEY ("ideaId") REFERENCES "project_idea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_team" ADD CONSTRAINT "FK_project_team_ownerId" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "project_team_vacancy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teamId" uuid NOT NULL, "role" "public"."project_role_enum" NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_project_team_vacancy_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_project_team_vacancy_teamId_role" ON "project_team_vacancy" ("teamId", "role")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_team_vacancy" ADD CONSTRAINT "FK_project_team_vacancy_teamId" FOREIGN KEY ("teamId") REFERENCES "project_team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "project_team_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teamId" uuid NOT NULL, "userId" integer NOT NULL, "role" "public"."project_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_project_team_member_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_project_team_member_teamId_userId" ON "project_team_member" ("teamId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_team_member" ADD CONSTRAINT "FK_project_team_member_teamId" FOREIGN KEY ("teamId") REFERENCES "project_team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_team_member" ADD CONSTRAINT "FK_project_team_member_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_team_member"`);
    await queryRunner.query(`DROP TABLE "project_team_vacancy"`);
    await queryRunner.query(`DROP TABLE "project_team"`);
    await queryRunner.query(`DROP TABLE "project_idea_interest"`);
    await queryRunner.query(`DROP TABLE "project_idea"`);
    await queryRunner.query(`DROP TYPE "public"."project_team_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."project_idea_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."project_role_enum"`);
    // Note: PostgreSQL doesn't support removing enum values; the new
    // notification types remain defined.
  }
}
