import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../files/domain/file';

export class ProjectUserSummary {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String, nullable: true })
  firstName: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: String, nullable: true })
  username?: string | null;

  @ApiProperty({ type: () => FileType, nullable: true })
  photo?: FileType | null;
}
