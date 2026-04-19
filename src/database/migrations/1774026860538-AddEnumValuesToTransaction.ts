import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnumValuesToTransaction1774026860538
  implements MigrationInterface
{
  name = 'AddEnumValuesToTransaction1774026860538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_category_enum" ADD VALUE IF NOT EXISTS 'AUDITOR_REWARD'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_category_enum" ADD VALUE IF NOT EXISTS 'TOKEN_TRANSFER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL não suporta remoção de valores de enum de forma nativa.
    // Para reverter, é necessário recriar o tipo manualmente.
    await queryRunner.query(`
      CREATE TYPE "transaction_category_enum_old" AS ENUM (
        'XP_REWARD', 'TOKEN_REWARD', 'STORE_PURCHASE', 'MANUAL_ADJUSTMENT'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "transaction"
        ALTER COLUMN "category" TYPE "transaction_category_enum_old"
        USING "category"::text::"transaction_category_enum_old"
    `);
    await queryRunner.query(`DROP TYPE "public"."transaction_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "transaction_category_enum_old" RENAME TO "transaction_category_enum"`,
    );
  }
}
