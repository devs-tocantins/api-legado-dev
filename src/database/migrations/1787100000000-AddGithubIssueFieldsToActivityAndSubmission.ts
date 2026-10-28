import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubIssueFieldsToActivityAndSubmission1787100000000
  implements MigrationInterface
{
  name = 'AddGithubIssueFieldsToActivityAndSubmission1787100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "createsGithubIssue" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."submission_githubrepo_enum" AS ENUM('FRONT', 'API')`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "githubRepo" "public"."submission_githubrepo_enum"`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."submission_issuecategory_enum" AS ENUM('BUG', 'MELHORIA', 'DUVIDA', 'OUTRO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "issueCategory" "public"."submission_issuecategory_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "submission" ADD "githubIssueUrl" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "githubIssueUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "issueCategory"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."submission_issuecategory_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "githubRepo"`,
    );
    await queryRunner.query(`DROP TYPE "public"."submission_githubrepo_enum"`);
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "createsGithubIssue"`,
    );
  }
}
