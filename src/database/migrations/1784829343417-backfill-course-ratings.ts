import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillCourseRatings1784829343417 implements MigrationInterface {
  name = 'BackfillCourseRatings1784829343417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH review_stats AS (
        SELECT 
          "courseId", 
          AVG(rating) as avg_rating, 
          COUNT(id) as total_reviews
        FROM "course_review"
        GROUP BY "courseId"
      )
      UPDATE "course" c
      SET 
        "averageRating" = rs.avg_rating,
        "totalReviews" = rs.total_reviews
      FROM review_stats rs
      WHERE c.id = rs."courseId";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Backfill is irreversible in a meaningful way here, but we can set them to 0/null to revert.
    await queryRunner.query(`
      UPDATE "course"
      SET "averageRating" = NULL, "totalReviews" = 0;
    `);
  }
}
