import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamificationProfile1774026860534
  implements MigrationInterface
{
  name = 'CreateGamificationProfile1774026860534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gamification_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "username" character varying NOT NULL, "totalXp" integer NOT NULL DEFAULT '0', "currentMonthlyXp" integer NOT NULL DEFAULT '0', "currentYearlyXp" integer NOT NULL DEFAULT '0', "gratitudeTokens" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_27ce3cd7dc60d9b6a0b57416e3b" UNIQUE ("userId"), CONSTRAINT "UQ_d8a946a752f5ba774af11861639" UNIQUE ("username"), CONSTRAINT "REL_27ce3cd7dc60d9b6a0b57416e3" UNIQUE ("userId"), CONSTRAINT "PK_751970a34a4e74d61034402c1a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD CONSTRAINT "FK_27ce3cd7dc60d9b6a0b57416e3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP CONSTRAINT "FK_27ce3cd7dc60d9b6a0b57416e3b"`,
    );
    await queryRunner.query(`DROP TABLE "gamification_profile"`);
  }
}
