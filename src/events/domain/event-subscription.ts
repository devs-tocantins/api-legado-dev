import { ApiProperty } from '@nestjs/swagger';

export class EventSubscription {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  eventId: string;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty()
  createdAt: Date;
}
