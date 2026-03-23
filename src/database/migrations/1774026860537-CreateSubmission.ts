import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubmission1774026860537 implements MigrationInterface {
  name = 'CreateSubmission1774026860537';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."submission_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "activityId" uuid NOT NULL, "proofUrl" character varying, "status" "public"."submission_status_enum" NOT NULL DEFAULT 'PENDING', "feedback" text, "awardedXp" integer NOT NULL DEFAULT '0', "reviewerId" integer, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(`DROP TABLE "submission"`);
    await queryRunner.query(`DROP TYPE "public"."submission_status_enum"`);
  }
}
