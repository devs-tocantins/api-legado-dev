import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectIdeaFeaturedAndCall1787400000000
  implements MigrationInterface
{
  name = 'ProjectIdeaFeaturedAndCall1787400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const value of ['PROJECT_IDEA_FEATURED', 'PROJECT_IDEA_CALLED']) {
      await queryRunner.query(
        `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS '${value}'`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "project_idea" ADD COLUMN "featuredAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea" ADD COLUMN "groupLink" character varying(300)`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea" ADD COLUMN "calledAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_idea" DROP COLUMN "calledAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea" DROP COLUMN "groupLink"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_idea" DROP COLUMN "featuredAt"`,
    );
    // PostgreSQL não remove valores de enum; os tipos de notificação ficam.
  }
}
