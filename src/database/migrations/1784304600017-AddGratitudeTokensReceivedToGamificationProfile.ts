import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGratitudeTokensReceivedToGamificationProfile1784304600017
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD COLUMN IF NOT EXISTS "gratitudeTokensReceived" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN IF EXISTS "gratitudeTokensReceived"`,
    );
  }
}
