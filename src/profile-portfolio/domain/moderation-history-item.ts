import { ApiProperty } from '@nestjs/swagger';

export class ModerationHistoryItem {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
