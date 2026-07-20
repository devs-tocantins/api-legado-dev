import { MigrationInterface, QueryRunner } from 'typeorm';

const BADGE_IMAGE_FILES: Record<string, string> = {
  Contribuidor: 'milestone-xp-1-contribuidor.svg',
  'Colaborador Ativo': 'milestone-xp-2-colaborador-ativo.svg',
  Referência: 'milestone-xp-3-referencia.svg',
  Mentor: 'milestone-xp-4-mentor.svg',
  Lenda: 'milestone-xp-5-lenda.svg',
  'Primeira Missão': 'milestone-sub-1-primeira-missao.svg',
  Colaborador: 'milestone-sub-2-colaborador.svg',
  'Herói da Comunidade': 'milestone-sub-3-heroi-da-comunidade.svg',
  Grato: 'milestone-tok-1-grato.svg',
  Generoso: 'milestone-tok-2-generoso.svg',
  'Membro Fundador': 'participation-1-membro-fundador.svg',
  Veterano: 'participation-2-veterano.svg',
  Ancião: 'participation-3-anciao.svg',
  'Pilar da Comunidade': 'participation-4-pilar-da-comunidade.svg',
  'Destaque do Mês': 'special-destaque-do-mes.svg',
  Organizador: 'special-organizador.svg',
};

const RANKING_POSITION_FILES: Record<number, string> = {
  1: 'ranking-1-ouro.svg',
  2: 'ranking-2-prata.svg',
  3: 'ranking-3-bronze.svg',
};

export class BackfillBadgeImageUrls1784304600011 implements MigrationInterface {
  name = 'BackfillBadgeImageUrls1784304600011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const frontendDomain = process.env.FRONTEND_DOMAIN;
    if (!frontendDomain) return;

    for (const [name, file] of Object.entries(BADGE_IMAGE_FILES)) {
      await queryRunner.query(
        `UPDATE "badge" SET "imageUrl" = $1 WHERE "name" = $2 AND "imageUrl" IS NULL`,
        [`${frontendDomain}/badges/${file}`, name],
      );
    }

    for (const [position, file] of Object.entries(RANKING_POSITION_FILES)) {
      await queryRunner.query(
        `UPDATE "badge" SET "imageUrl" = $1
         WHERE "category" = 'RANKING'
           AND "criteriaConfig"->>'position' = $2
           AND "imageUrl" IS NULL`,
        [`${frontendDomain}/badges/${file}`, position],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const allFiles = [
      ...Object.values(BADGE_IMAGE_FILES),
      ...Object.values(RANKING_POSITION_FILES),
    ];
    const patterns = allFiles.map((f) => `%/badges/${f}`);

    await queryRunner.query(
      `UPDATE "badge" SET "imageUrl" = NULL WHERE "imageUrl" LIKE ANY ($1)`,
      [patterns],
    );
  }
}
