export enum SubmissionContributionKind {
  // Ajuda real prestada à comunidade (atividade de voluntariado), conta para
  // selos de "contribuição" e para o extrato público de contribuições.
  COMMUNITY_ACTIVITY = 'COMMUNITY_ACTIVITY',
  // Marco de trilha de aprendizado (prova ou test-out) — XP pessoal, não é
  // contribuição para a comunidade e não deve contar para selos desse tipo.
  TRACK_PROGRESS = 'TRACK_PROGRESS',
}
