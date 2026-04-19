import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiresDescriptionAndSubmissionDescription1776377975108
  implements MigrationInterface
{
  name = 'AddRequiresDescriptionAndSubmissionDescription1776377975108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" DROP CONSTRAINT "FK_gpb_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" DROP CONSTRAINT "FK_gpb_badge"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" DROP CONSTRAINT "UQ_profile_badge"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "requiresDescription" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "submission" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" ADD CONSTRAINT "UQ_706b52ddd452df883b1cc210623" UNIQUE ("profileId", "badgeId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" ADD CONSTRAINT "FK_1d1785a14ca998d8d2570d5acef" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" ADD CONSTRAINT "FK_aa1482357f205117884e68a55a0" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" DROP CONSTRAINT "FK_aa1482357f205117884e68a55a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" DROP CONSTRAINT "FK_1d1785a14ca998d8d2570d5acef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" DROP CONSTRAINT "UQ_706b52ddd452df883b1cc210623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "requiresDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" ADD CONSTRAINT "UQ_profile_badge" UNIQUE ("badgeId", "profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" ADD CONSTRAINT "FK_gpb_badge" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile_badge" ADD CONSTRAINT "FK_gpb_profile" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
