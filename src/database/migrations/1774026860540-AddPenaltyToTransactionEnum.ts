import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPenaltyToTransactionEnum1774026860540
  implements MigrationInterface
{
  name = 'AddPenaltyToTransactionEnum1774026860540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_category_enum" ADD VALUE IF NOT EXISTS 'PENALTY'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL não suporta remoção de valores de enum nativamente.
    // Para reverter: recriar o tipo manualmente sem o valor PENALTY.
    await queryRunner.query(`
      CREATE TYPE "transaction_category_enum_new" AS ENUM (
        'XP_REWARD', 'TOKEN_REWARD', 'STORE_PURCHASE', 'MANUAL_ADJUSTMENT',
        'AUDITOR_REWARD', 'TOKEN_TRANSFER'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "transaction"
        ALTER COLUMN "category" TYPE "transaction_category_enum_new"
        USING "category"::text::"transaction_category_enum_new"
    `);
    await queryRunner.query(`DROP TYPE "public"."transaction_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "transaction_category_enum_new" RENAME TO "transaction_category_enum"`,
    );
  }
}
