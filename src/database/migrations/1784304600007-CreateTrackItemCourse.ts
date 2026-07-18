import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrackItemCourse1784304600007 implements MigrationInterface {
  name = 'CreateTrackItemCourse1784304600007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "track_item_course" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "trackItemId" uuid NOT NULL,
        "courseId" uuid NOT NULL,
        "submittedByProfileId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_track_item_course" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_track_item_course_item_course" UNIQUE ("trackItemId", "courseId"),
        CONSTRAINT "FK_track_item_course_trackItem" FOREIGN KEY ("trackItemId") REFERENCES "track_item"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_track_item_course_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_track_item_course_profile" FOREIGN KEY ("submittedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE SET NULL
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "track_item_course"`);
  }
}
