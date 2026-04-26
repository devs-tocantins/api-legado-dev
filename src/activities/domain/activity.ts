import { ApiProperty } from '@nestjs/swagger';

export class Activity {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Título da atividade',
    example: 'Artigo Publicado',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Descrição detalhada da atividade',
    example: 'Publicou um artigo técnico em blog ou plataforma reconhecida',
  })
  description: string;

  @ApiProperty({
    type: Number,
    description: 'Pontos XP fixos concedidos por esta atividade',
    example: 100,
  })
  fixedReward: number;

  @ApiProperty({
    type: Boolean,
    description: 'Se true, só é acessível por QR Code secreto em eventos',
    example: false,
  })
  isHidden: boolean;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Slug/código secreto para atividades ocultas de eventos',
    example: 'meetup-outubro-2026',
  })
  secretCode: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Exige preenchimento da proofUrl na submissão',
    example: true,
  })
  requiresProof: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Exige preenchimento de descrição na submissão',
    example: false,
  })
  requiresDescription: boolean;

  @ApiProperty({
    type: Number,
    description: 'Horas de cooldown anti-farming para o mesmo usuário',
    example: 24,
  })
  cooldownHours: number;

  @ApiProperty({
    type: Number,
    description: 'Pontos XP concedidos ao auditor por revisar esta atividade',
    example: 10,
  })
  auditorReward: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
