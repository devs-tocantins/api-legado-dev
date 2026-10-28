import { MigrationInterface, QueryRunner } from 'typeorm';

const LABELS: Record<string, string> = {
  FRONTEND: 'Front-end',
  BACKEND: 'Back-end',
  DATABASE: 'Banco de dados',
  REQUIREMENTS_ANALYST: 'Analista de requisitos',
  UX_DESIGNER: 'UX/UI Designer',
  QA: 'QA / Testes',
  DEVOPS: 'DevOps',
  MOBILE: 'Mobile',
  PROJECT_MANAGER: 'Gerente de projeto',
};

export class ProjectIdeaRoles1787300000000 implements MigrationInterface {
  name = 'ProjectIdeaRoles1787300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_idea_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ideaId" uuid NOT NULL, "name" character varying(40) NOT NULL, "position" integer NOT NULL DEFAULT 0, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_project_idea_role_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_project_idea_role_ideaId_name" ON "project_idea_role" ("ideaId", "name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea_role" ADD CONSTRAINT "FK_project_idea_role_ideaId" FOREIGN KEY ("ideaId") REFERENCES "project_idea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // O cargo da participação passa a ser o nome do cargo da ideia.
    const cases = Object.entries(LABELS)
      .map(([key, label]) => `WHEN '${key}' THEN '${label}'`)
      .join(' ');
    await queryRunner.query(
      `ALTER TABLE "project_idea_interest" ALTER COLUMN "role" TYPE character varying(40) USING (CASE "role"::text ${cases} ELSE "role"::text END)`,
    );

    // Cada pessoa pode participar de vários cargos da mesma ideia.
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_project_idea_interest_ideaId_userId"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_project_idea_interest_ideaId_userId_role" ON "project_idea_interest" ("ideaId", "userId", "role")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_project_idea_interest_ideaId_userId_role"`,
    );
    // Mantém só uma participação por pessoa e descarta cargos personalizados.
    const reverse = Object.entries(LABELS)
      .map(([key, label]) => `WHEN '${label}' THEN '${key}'`)
      .join(' ');
    await queryRunner.query(
      `DELETE FROM "project_idea_interest" WHERE "role" NOT IN (${Object.values(
        LABELS,
      )
        .map((label) => `'${label}'`)
        .join(', ')})`,
    );
    await queryRunner.query(
      `DELETE FROM "project_idea_interest" a USING "project_idea_interest" b WHERE a."ideaId" = b."ideaId" AND a."userId" = b."userId" AND a."createdAt" > b."createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea_interest" ALTER COLUMN "role" TYPE "public"."project_role_enum" USING (CASE "role" ${reverse} END)::"public"."project_role_enum"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_project_idea_interest_ideaId_userId" ON "project_idea_interest" ("ideaId", "userId")`,
    );
    await queryRunner.query(`DROP TABLE "project_idea_role"`);
  }
}
