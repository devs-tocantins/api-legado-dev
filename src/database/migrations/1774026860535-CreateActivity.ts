import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivity1774026860535 implements MigrationInterface {
  name = 'CreateActivity1774026860535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "fixedReward" integer NOT NULL, "isHidden" boolean NOT NULL DEFAULT false, "secretCode" character varying, "requiresProof" boolean NOT NULL DEFAULT false, "cooldownHours" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activity"`);
  }
}
