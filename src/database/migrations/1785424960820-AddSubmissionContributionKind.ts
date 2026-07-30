import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionContributionKind1785424960820
  implements MigrationInterface
{
  name = 'AddSubmissionContributionKind1785424960820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."submission_contributionkind_enum" AS ENUM('COMMUNITY_ACTIVITY', 'TRACK_PROGRESS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "contributionKind" "public"."submission_contributionkind_enum"`,
    );

    // Backfill: até aqui, a única forma de saber o tipo era a nulidade de
    // trackItemId — formalizamos isso como coluna explícita para não
    // depender mais dessa inferência implícita em regras de negócio.
    await queryRunner.query(
      `UPDATE "submission" SET "contributionKind" = (CASE WHEN "trackItemId" IS NULL THEN 'COMMUNITY_ACTIVITY' ELSE 'TRACK_PROGRESS' END)::"public"."submission_contributionkind_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "submission" ALTER COLUMN "contributionKind" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ALTER COLUMN "contributionKind" SET DEFAULT 'COMMUNITY_ACTIVITY'`,
    );

    // Limpeza: o selo "Primeira Missão" (e por extensão "Colaborador" /
    // "Herói da Comunidade") contava qualquer submission com status
    // APPROVED, incluindo test-out de marcos de trilha (0 XP, não é
    // contribuição). Revoga concessões que não têm nenhuma submissão real
    // de comunidade aprovada por trás — usuários voltam a poder ganhá-lo
    // legitimamente na próxima avaliação de moderação.
    await queryRunner.query(`
      DELETE FROM "gamification_profile_badge" gpb
      USING "badge" b
      WHERE gpb."badgeId" = b.id
        AND b.name IN ('Primeira Missão', 'Colaborador', 'Herói da Comunidade')
        AND (
          SELECT COUNT(*) FROM "submission" s
          WHERE s."profileId" = gpb."profileId"
            AND s.status = 'APPROVED'
            AND s."isTestOut" = false
            AND s."contributionKind" = 'COMMUNITY_ACTIVITY'
        ) < (b."criteriaConfig"->>'threshold')::int
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "contributionKind"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."submission_contributionkind_enum"`,
    );
  }
}
