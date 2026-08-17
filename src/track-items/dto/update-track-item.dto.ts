// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateTrackItemDto } from './create-track-item.dto';

export class UpdateTrackItemDto extends PartialType(CreateTrackItemDto) {}
