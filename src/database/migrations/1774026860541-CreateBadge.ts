import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBadge1774026860541 implements MigrationInterface {
  name = 'CreateBadge1774026860541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."badge_criteriatype_enum" AS ENUM ('AUTOMATIC', 'MANUAL')`,
    );
    await queryRunner.query(`
      CREATE TABLE "badge" (
        "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"          character varying NOT NULL,
        "description"   character varying NOT NULL,
        "imageUrl"      character varying,
        "criteriaType"  "public"."badge_criteriatype_enum" NOT NULL,
        "criteriaConfig" jsonb,
        "isActive"      boolean           NOT NULL DEFAULT true,
        "createdAt"     TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_badge_name" UNIQUE ("name"),
        CONSTRAINT "PK_badge" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "badge"`);
    await queryRunner.query(`DROP TYPE "public"."badge_criteriatype_enum"`);
  }
}
