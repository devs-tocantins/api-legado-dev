import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditorAndParticipationRewards1777217102853
  implements MigrationInterface
{
  name = 'AddAuditorAndParticipationRewards1777217102853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "auditorReward" integer NOT NULL DEFAULT '10'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "participationReward" integer NOT NULL DEFAULT '50'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "auditorReward" integer NOT NULL DEFAULT '20'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "auditorReward"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "participationReward"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "auditorReward"`,
    );
  }
}
