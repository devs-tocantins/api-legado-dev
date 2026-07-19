import { ApiProperty } from '@nestjs/swagger';
import { EffortLevel } from './effort-level.enum';

export class EffortTier {
  @ApiProperty({ enum: EffortLevel })
  level: EffortLevel;

  @ApiProperty({ example: 'Pequeno' })
  label: string;

  @ApiProperty({ example: 'PR de correção de README' })
  example: string;

  @ApiProperty({ example: 40 })
  xp: number;
}
