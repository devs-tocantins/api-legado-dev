import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissionIsSecret1776600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mission" ADD COLUMN IF NOT EXISTS "isSecret" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN IF EXISTS "isSecret"`,
    );
  }
}
