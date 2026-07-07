import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhatsappNumberToGamificationProfile1783500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD COLUMN IF NOT EXISTS "whatsappNumber" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN IF EXISTS "whatsappNumber"`,
    );
  }
}
