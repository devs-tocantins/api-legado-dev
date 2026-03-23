import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransaction1774026860536 implements MigrationInterface {
  name = 'CreateTransaction1774026860536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_category_enum" AS ENUM('XP_REWARD', 'TOKEN_REWARD', 'STORE_PURCHASE', 'MANUAL_ADJUSTMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" "public"."transaction_category_enum" NOT NULL, "amount" integer NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "profileId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_40f48b62d61cf6124ae338e0b0c" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_40f48b62d61cf6124ae338e0b0c"`,
    );
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_category_enum"`);
  }
}
