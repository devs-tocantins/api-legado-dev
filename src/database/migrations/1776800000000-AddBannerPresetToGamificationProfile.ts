import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBannerPresetToGamificationProfile1776800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD COLUMN IF NOT EXISTS "bannerPreset" varchar(50) NOT NULL DEFAULT 'default'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN IF EXISTS "bannerPreset"`,
    );
  }
}
