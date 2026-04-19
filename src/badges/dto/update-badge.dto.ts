import { PartialType } from '@nestjs/swagger';
import { CreateBadgeDto } from './create-badge.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBadgeDto extends PartialType(CreateBadgeDto) {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
