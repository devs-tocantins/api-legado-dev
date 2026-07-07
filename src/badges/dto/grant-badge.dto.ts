import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GrantBadgeDto {
  @ApiProperty({ type: String, description: 'UUID do badge a conceder' })
  @IsString()
  @IsNotEmpty()
  badgeId: string;

  @ApiProperty({ type: String, description: 'UUID do perfil destinatário' })
  @IsString()
  @IsNotEmpty()
  profileId: string;
}
