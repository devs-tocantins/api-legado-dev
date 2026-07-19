import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEffortTiersAndFreeformActivity1784304600008
  implements MigrationInterface
{
  name = 'AddEffortTiersAndFreeformActivity1784304600008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" ADD "effortTiers" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "isFreeform" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."submission_declaredeffort_enum" AS ENUM('P', 'M', 'G', 'EPICO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "customTitle" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "declaredEffort" "public"."submission_declaredeffort_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "declaredEffort"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "customTitle"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."submission_declaredeffort_enum"`,
    );

    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "isFreeform"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "effortTiers"`);
  }
}
