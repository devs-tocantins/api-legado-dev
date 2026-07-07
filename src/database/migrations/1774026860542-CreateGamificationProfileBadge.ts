import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamificationProfileBadge1774026860542
  implements MigrationInterface
{
  name = 'CreateGamificationProfileBadge1774026860542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "gamification_profile_badge" (
        "id"          uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "profileId"   uuid    NOT NULL,
        "badgeId"     uuid    NOT NULL,
        "unlockedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "grantedBy"   integer,
        CONSTRAINT "UQ_profile_badge" UNIQUE ("profileId", "badgeId"),
        CONSTRAINT "PK_gamification_profile_badge" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gpb_profile" FOREIGN KEY ("profileId")
          REFERENCES "gamification_profile" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gpb_badge" FOREIGN KEY ("badgeId")
          REFERENCES "badge" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gamification_profile_badge"`);
  }
}
