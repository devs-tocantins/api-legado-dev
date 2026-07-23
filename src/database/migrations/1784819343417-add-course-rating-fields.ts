import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseRatingFields1784819343417 implements MigrationInterface {
  name = 'AddCourseRatingFields1784819343417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" ADD "averageRating" numeric(3,2)`,
    );
    await queryRunner.query(`ALTER TABLE "course" ADD "totalReviews" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "totalReviews"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "averageRating"`);
  }
}
