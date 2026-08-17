import { AuditActionEnum } from '../domain/audit-action.enum';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsInt()
  actorUserId?: number | null;

  @IsEnum(AuditActionEnum)
  action: AuditActionEnum;

  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsOptional()
  @IsInt()
  targetUserId?: number | null;

  @IsOptional()
  @IsObject()
  metadata?: any | null;
}
