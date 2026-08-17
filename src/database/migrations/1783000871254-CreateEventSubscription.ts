import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventSubscription1783000871254
  implements MigrationInterface
{
  name = 'CreateEventSubscription1783000871254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."event_status_enum" ADD VALUE IF NOT EXISTS 'CANCELLED'`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_event_subscription_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_event_subscription_eventId_userId" ON "event_subscription" ("eventId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_event_subscription_eventId" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_event_subscription_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_event_subscription_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_event_subscription_eventId"`,
    );
    await queryRunner.query(`DROP TABLE "event_subscription"`);
    // Note: PostgreSQL doesn't support removing enum values; CANCELLED remains defined.
  }
}
