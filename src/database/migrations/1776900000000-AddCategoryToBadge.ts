import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToBadge1776900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
         CREATE TYPE badge_category_enum AS ENUM ('MILESTONE', 'RANKING', 'PARTICIPATION', 'SPECIAL');
       EXCEPTION WHEN duplicate_object THEN NULL;
       END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "badge" ADD COLUMN IF NOT EXISTS "category" badge_category_enum NOT NULL DEFAULT 'SPECIAL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "badge" DROP COLUMN IF EXISTS "category"`,
    );
  }
}
