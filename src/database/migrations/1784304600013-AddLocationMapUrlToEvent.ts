import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationMapUrlToEvent1784304600013
  implements MigrationInterface
{
  name = 'AddLocationMapUrlToEvent1784304600013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" ADD "locationMapUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "locationMapUrl"`);
  }
}
