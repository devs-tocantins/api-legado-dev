import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarConfigToGamificationProfile1783600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD COLUMN IF NOT EXISTS "avatarConfig" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD COLUMN IF NOT EXISTS "avatarSvg" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN IF EXISTS "avatarConfig"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN IF EXISTS "avatarSvg"`,
    );
  }
}
