import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRankingSnapshot1784304600016 implements MigrationInterface {
  name = 'CreateRankingSnapshot1784304600016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ranking_snapshot" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "profileId" uuid NOT NULL,
        "periodType" character varying NOT NULL,
        "periodKey" character varying NOT NULL,
        "position" integer NOT NULL,
        "xpAtSnapshot" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ranking_snapshot_profile_period" UNIQUE ("profileId", "periodType", "periodKey"),
        CONSTRAINT "PK_ranking_snapshot_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ranking_snapshot_period" ON "ranking_snapshot" ("periodType", "periodKey")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ranking_snapshot_profileId" ON "ranking_snapshot" ("profileId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ranking_snapshot"`);
  }
}
