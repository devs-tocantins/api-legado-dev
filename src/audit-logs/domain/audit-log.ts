import { AuditActionEnum } from './audit-action.enum';

export class AuditLog {
  id: string;
  actorUserId: number | null;
  action: AuditActionEnum;
  entityType: string;
  entityId: string;
  targetUserId: number | null;
  metadata: any | null;
  createdAt: Date;
}
