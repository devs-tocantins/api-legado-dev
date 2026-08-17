import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReadAtToNotification1784304600015
  implements MigrationInterface
{
  name = 'AddReadAtToNotification1784304600015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "readAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "readAt"`);
  }
}
