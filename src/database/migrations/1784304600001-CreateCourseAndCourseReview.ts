import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseAndCourseReview1784304600001
  implements MigrationInterface
{
  name = 'CreateCourseAndCourseReview1784304600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."course_status_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "provider" character varying, "url" character varying NOT NULL, "isFree" boolean NOT NULL DEFAULT true, "price" numeric, "language" character varying, "submittedByProfileId" uuid, "status" "public"."course_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_course_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_course_submittedByProfileId" FOREIGN KEY ("submittedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "course_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" uuid NOT NULL, "profileId" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "provenCompletion" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_course_review_courseId_profileId" UNIQUE ("courseId", "profileId"), CONSTRAINT "PK_course_review_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_course_review_courseId" ON "course_review" ("courseId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_course_review_courseId" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_course_review_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_course_review_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_course_review_courseId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_course_review_courseId"`);
    await queryRunner.query(`DROP TABLE "course_review"`);

    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_course_submittedByProfileId"`,
    );
    await queryRunner.query(`DROP TABLE "course"`);
    await queryRunner.query(`DROP TYPE "public"."course_status_enum"`);
  }
}
