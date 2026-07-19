import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedFreeformActivity1784304600009 implements MigrationInterface {
  name = 'SeedFreeformActivity1784304600009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM "activity" WHERE "isFreeform" = true LIMIT 1`,
    );
    if (existing.length > 0) return;

    const effortTiers = JSON.stringify([
      {
        level: 'P',
        label: 'Pequeno',
        example: 'Corrigir um typo, responder uma dúvida rápida',
        xp: 40,
      },
      {
        level: 'M',
        label: 'Médio',
        example: 'PR de correção de bug, organizar um pequeno evento',
        xp: 120,
      },
      {
        level: 'G',
        label: 'Grande',
        example: 'Feature completa, mentoria continuada de um júnior',
        xp: 250,
      },
      {
        level: 'EPICO',
        label: 'Épico',
        example: 'Arquitetura do zero, organizar um evento grande',
        xp: 400,
      },
    ]);

    await queryRunner.query(
      `INSERT INTO "activity"
        (title, description, "fixedReward", "isHidden", "secretCode", "requiresProof", "requiresDescription", "cooldownHours", "effortTiers", "isFreeform")
       VALUES ($1, $2, 0, false, null, false, true, 0, $3::jsonb, true)`,
      [
        'Registrar outra atividade',
        'Fez alguma contribuição voluntária para a comunidade que não está no catálogo? ' +
          'Descreva o que fez, escolha a faixa de esforço que melhor representa o trabalho ' +
          '(com um exemplo pra te ajudar a calibrar) e envie um comprovante se tiver. ' +
          'Vai passar pela mesma moderação de qualquer outra atividade.',
        effortTiers,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "activity" WHERE "isFreeform" = true`);
  }
}
