import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ApplyPenaltyDto {
  @ApiProperty({
    type: Number,
    description: 'Quantidade de XP a debitar (valor positivo)',
    example: 50,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    type: String,
    description: 'Motivo da penalidade (obrigatório para rastreabilidade)',
    example: 'Fraude em submissão de evidências',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
