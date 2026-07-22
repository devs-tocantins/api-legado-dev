import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofFormatToTrackItem1784304600018
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD COLUMN IF NOT EXISTS "proofFormat" character varying NOT NULL DEFAULT 'EITHER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP COLUMN IF EXISTS "proofFormat"`,
    );
  }
}
