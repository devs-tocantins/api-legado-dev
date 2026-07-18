import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommunityXpRewardAndBackfillProofActivities1784304600006
  implements MigrationInterface
{
  name = 'AddCommunityXpRewardAndBackfillProofActivities1784304600006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD "communityXpReward" integer NOT NULL DEFAULT 0`,
    );

    const orphanProofItems: Array<{
      id: string;
      title: string;
      communityXpReward: number;
      grantsCommunityXp: boolean;
    }> = await queryRunner.query(
      `SELECT id, title, "communityXpReward", "grantsCommunityXp" FROM "track_item" WHERE type = 'PROOF' AND "activityId" IS NULL`,
    );

    for (const item of orphanProofItems) {
      const fixedReward = item.grantsCommunityXp ? item.communityXpReward : 0;
      const activityRows: Array<{ id: string }> = await queryRunner.query(
        `INSERT INTO "activity" (title, description, "fixedReward", "isHidden", "requiresProof", "requiresDescription", "cooldownHours")
         VALUES ($1, $2, $3, true, true, false, 0)
         RETURNING id`,
        [
          `Prova: ${item.title}`,
          `Comprovação exclusiva do marco de trilha "${item.title}".`,
          fixedReward,
        ],
      );
      await queryRunner.query(
        `UPDATE "track_item" SET "activityId" = $1 WHERE id = $2`,
        [activityRows[0].id, item.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP COLUMN "communityXpReward"`,
    );
    // Não reverte as atividades exclusivas criadas no backfill nem o
    // activityId preenchido — não há como distinguir com segurança quais
    // vieram do backfill de eventuais vínculos manuais feitos depois.
  }
}
