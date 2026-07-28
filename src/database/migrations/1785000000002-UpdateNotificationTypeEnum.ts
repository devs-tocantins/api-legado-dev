import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationTypeEnum1785000000002
  implements MigrationInterface
{
  name = 'UpdateNotificationTypeEnum1785000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS 'EVENT_UPDATED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notification_type_enum" ADD VALUE IF NOT EXISTS 'EVENT_CANCELLED'`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres does not support removing enum values
  }
}
