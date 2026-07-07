import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGamificationProfileDto {
  @ApiProperty({
    description: 'ID do usuário vinculado (1:1)',
    example: 1,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: '@handle único do usuário',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;
}
