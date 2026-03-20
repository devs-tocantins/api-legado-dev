import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamificationProfile1774027992307
  implements MigrationInterface
{
  name = 'CreateGamificationProfile1774027992307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gamification_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "username" character varying NOT NULL, "totalXp" integer NOT NULL DEFAULT '0', "currentMonthlyXp" integer NOT NULL DEFAULT '0', "currentYearlyXp" integer NOT NULL DEFAULT '0', "gratitudeTokens" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_27ce3cd7dc60d9b6a0b57416e3b" UNIQUE ("userId"), CONSTRAINT "UQ_d8a946a752f5ba774af11861639" UNIQUE ("username"), CONSTRAINT "REL_27ce3cd7dc60d9b6a0b57416e3" UNIQUE ("userId"), CONSTRAINT "PK_751970a34a4e74d61034402c1a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_category_enum" AS ENUM('XP_REWARD', 'TOKEN_REWARD', 'STORE_PURCHASE', 'MANUAL_ADJUSTMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" "public"."transaction_category_enum" NOT NULL, "amount" integer NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "profileId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "fixedReward" integer NOT NULL, "isHidden" boolean NOT NULL DEFAULT false, "secretCode" character varying, "requiresProof" boolean NOT NULL DEFAULT false, "cooldownHours" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."submission_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "activityId" uuid NOT NULL, "proofUrl" character varying, "status" "public"."submission_status_enum" NOT NULL DEFAULT 'PENDING', "feedback" text, "awardedXp" integer NOT NULL DEFAULT '0', "reviewerId" integer, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" ADD CONSTRAINT "FK_27ce3cd7dc60d9b6a0b57416e3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_40f48b62d61cf6124ae338e0b0c" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_2fcc35bbe761da8cf9d28395363" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_ac0f363ae3899b18a19c7a3b998" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_7a1a534e9c0fd66198ea2291d27" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_7a1a534e9c0fd66198ea2291d27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_ac0f363ae3899b18a19c7a3b998"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_2fcc35bbe761da8cf9d28395363"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_40f48b62d61cf6124ae338e0b0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamification_profile" DROP CONSTRAINT "FK_27ce3cd7dc60d9b6a0b57416e3b"`,
    );
    await queryRunner.query(`DROP TABLE "submission"`);
    await queryRunner.query(`DROP TYPE "public"."submission_status_enum"`);
    await queryRunner.query(`DROP TABLE "activity"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_category_enum"`);
    await queryRunner.query(`DROP TABLE "gamification_profile"`);
  }
}
