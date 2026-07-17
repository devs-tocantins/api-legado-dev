import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJourneyXpToGamificationProfile1784304600000
  implements MigrationInterface
{
  name = 'AddJourneyXpToGamificationProfile1784304600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD "journeyXp" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP COLUMN "journeyXp"`,
    );
  }
}
