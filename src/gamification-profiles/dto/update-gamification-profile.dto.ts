// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateGamificationProfileDto } from './create-gamification-profile.dto';

export class UpdateGamificationProfileDto extends PartialType(
  CreateGamificationProfileDto,
) {}
