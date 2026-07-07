import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubUsernameToGamificationProfile1776399096043
  implements MigrationInterface
{
  name = 'AddGithubUsernameToGamificationProfile1776399096043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD "githubUsername" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN "githubUsername"`,
    );
  }
}
