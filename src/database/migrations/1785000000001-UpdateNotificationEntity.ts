import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationEntity1785000000001
  implements MigrationInterface
{
  name = 'UpdateNotificationEntity1785000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" ADD "payload" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "link" character varying(500)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "link"`);
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "payload"`);
  }
}
