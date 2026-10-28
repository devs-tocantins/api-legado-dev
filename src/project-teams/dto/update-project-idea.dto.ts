import { PartialType } from '@nestjs/swagger';
import { CreateProjectIdeaDto } from './create-project-idea.dto';

export class UpdateProjectIdeaDto extends PartialType(CreateProjectIdeaDto) {}
