import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastNotifiedLegalVersionToUser1784304600010
  implements MigrationInterface
{
  name = 'AddLastNotifiedLegalVersionToUser1784304600010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastNotifiedLegalVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS 'LEGAL_DOCUMENT_UPDATED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "lastNotifiedLegalVersion"`,
    );
    // Postgres does not support removing enum values; down() intentionally
    // leaves LEGAL_DOCUMENT_UPDATED in the type.
  }
}
