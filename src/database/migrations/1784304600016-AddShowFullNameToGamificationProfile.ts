import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShowFullNameToGamificationProfile1784304600016
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD COLUMN IF NOT EXISTS "showFullName" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN IF EXISTS "showFullName"`,
    );
  }
}
