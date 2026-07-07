import { ApiProperty } from '@nestjs/swagger';

export class ServiceHealthDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ required: false })
  error?: string;
}

export class AdminHealthDto {
  @ApiProperty({ type: ServiceHealthDto })
  database: ServiceHealthDto;

  @ApiProperty({ type: ServiceHealthDto })
  smtp: ServiceHealthDto;

  @ApiProperty({ type: ServiceHealthDto })
  storage: ServiceHealthDto;

  @ApiProperty()
  allOk: boolean;
}
