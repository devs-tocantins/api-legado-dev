import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToCourse1784304600016 implements MigrationInterface {
  name = 'AddDescriptionToCourse1784304600016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "description" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "description"`);
  }
}
