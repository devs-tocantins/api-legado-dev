import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsBannedToUser1774026860539 implements MigrationInterface {
  name = 'AddIsBannedToUser1774026860539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isBanned" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isBanned"`);
  }
}
