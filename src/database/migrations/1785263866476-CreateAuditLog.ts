import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog1785263866476 implements MigrationInterface {
  name = 'CreateAuditLog1785263866476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actorUserId" integer, "action" character varying(100) NOT NULL, "entityType" character varying(100) NOT NULL, "entityId" character varying(100) NOT NULL, "targetUserId" integer, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_actorUserId" ON "audit_log" ("actorUserId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_createdAt" ON "audit_log" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_entityType_entityId" ON "audit_log" ("entityType", "entityId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_audit_log_entityType_entityId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_actorUserId"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}
