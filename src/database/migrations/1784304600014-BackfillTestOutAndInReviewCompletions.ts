import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Antes desta mudanca, uma submissao de prova (real ou test-out) so ganhava
 * um TrackItemCompletion quando o moderador aprovava - ate la, o usuario
 * ficava travado no marco. Agora a completion e criada na hora da submissao
 * (SKIPPED_TESTOUT pra test-out, IN_REVIEW pra prova normal aguardando
 * revisao), liberando o avanco na trilha imediatamente; so o XP continua
 * dependendo da aprovacao.
 *
 * Esta migracao resolve retroativamente as submissoes PENDING que ja
 * existiam antes da mudanca:
 * - test-out ainda PENDING -> aprova automaticamente (sem XP) e cria a
 *   completion SKIPPED_TESTOUT.
 * - prova normal ainda PENDING -> cria a completion IN_REVIEW (sem XP),
 *   deixando a submissao como esta (aguardando revisao humana de verdade).
 *
 * Idempotente: so afeta linhas que ainda nao tem completion para o par
 * (itemId, profileId).
 */
export class BackfillTestOutAndInReviewCompletions1784304600014
  implements MigrationInterface
{
  name = 'BackfillTestOutAndInReviewCompletions1784304600014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH candidates AS (
        SELECT DISTINCT ON (s."trackItemId", s."profileId")
          s.id, s."trackItemId", s."profileId"
        FROM "submission" s
        WHERE s."isTestOut" = true
          AND s.status = 'PENDING'
          AND s."trackItemId" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "track_item_completion" tic
            WHERE tic."itemId" = s."trackItemId" AND tic."profileId" = s."profileId"
          )
        ORDER BY s."trackItemId", s."profileId", s."createdAt" ASC
      )
      INSERT INTO "track_item_completion"
        ("itemId", "profileId", status, "submissionId", "awardedJourneyXp", "completedAt")
      SELECT c."trackItemId", c."profileId", 'SKIPPED_TESTOUT', c.id, 0, now()
      FROM candidates c
      ON CONFLICT ("itemId", "profileId") DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE "submission"
      SET status = 'APPROVED', "reviewedAt" = now()
      WHERE "isTestOut" = true
        AND status = 'PENDING'
        AND "trackItemId" IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM "track_item_completion" tic
          WHERE tic."itemId" = "submission"."trackItemId"
            AND tic."profileId" = "submission"."profileId"
            AND tic."submissionId" = "submission".id
        )
    `);

    await queryRunner.query(`
      WITH candidates AS (
        SELECT DISTINCT ON (s."trackItemId", s."profileId")
          s.id, s."trackItemId", s."profileId"
        FROM "submission" s
        WHERE s."isTestOut" = false
          AND s.status = 'PENDING'
          AND s."trackItemId" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "track_item_completion" tic
            WHERE tic."itemId" = s."trackItemId" AND tic."profileId" = s."profileId"
          )
        ORDER BY s."trackItemId", s."profileId", s."createdAt" ASC
      )
      INSERT INTO "track_item_completion"
        ("itemId", "profileId", status, "submissionId", "awardedJourneyXp", "completedAt")
      SELECT c."trackItemId", c."profileId", 'IN_REVIEW', c.id, 0, now()
      FROM candidates c
      ON CONFLICT ("itemId", "profileId") DO NOTHING
    `);
  }

  public async down(): Promise<void> {
    // Backfill de dados - nao ha rollback seguro (voltaria a travar usuarios
    // que ja avancaram na trilha com base nesta correcao).
  }
}
