import { ApiProperty } from '@nestjs/swagger';
import { GamificationProfile } from '../../gamification-profiles/domain/gamification-profile';
import { TransactionCategoryEnum } from './transaction-category.enum';

export class Transaction {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({ type: () => GamificationProfile })
  profile: GamificationProfile;

  @ApiProperty({ enum: TransactionCategoryEnum })
  category: TransactionCategoryEnum;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: false, nullable: true })
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
