import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../files/domain/file';

export class GamificationProfile {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Number,
    description: 'ID do usuário vinculado (1:1)',
  })
  userId: number;

  @ApiProperty({
    type: String,
    description: '@handle único do usuário',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    type: Number,
    description: 'XP total histórico (Rank Global)',
    example: 0,
  })
  totalXp: number;

  @ApiProperty({
    type: Number,
    description: 'XP acumulado no ciclo mensal atual',
    example: 0,
  })
  currentMonthlyXp: number;

  @ApiProperty({
    type: Number,
    description: 'XP acumulado no ano atual',
    example: 0,
  })
  currentYearlyXp: number;

  @ApiProperty({
    type: Number,
    description: 'Tokens de gratidão disponíveis (reset mensal)',
    example: 0,
  })
  gratitudeTokens: number;

  @ApiProperty({ type: Boolean, default: false })
  isBanned: boolean;

  @ApiProperty({ type: String, required: false, nullable: true })
  githubUsername?: string | null;

  @ApiProperty({ type: String, default: 'default' })
  bannerPreset: string = 'default';

  @ApiProperty({ type: String, required: false })
  firstName?: string;

  @ApiProperty({ type: String, required: false })
  lastName?: string;

  @ApiProperty({ type: () => FileType, required: false, nullable: true })
  photo?: FileType | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
