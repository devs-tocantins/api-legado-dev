import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionCategoryEnum } from '../domain/transaction-category.enum';
import { GamificationProfile } from '../../gamification-profiles/domain/gamification-profile';

export class CreateTransactionDto {
  @ApiProperty({ type: () => GamificationProfile })
  @IsNotEmpty()
  profile: GamificationProfile;

  @ApiProperty({ enum: TransactionCategoryEnum })
  @IsEnum(TransactionCategoryEnum)
  @IsNotEmpty()
  category: TransactionCategoryEnum;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
