import {
  // common
  Module,
} from '@nestjs/common';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { UsersCronService } from './users-cron.service';
import { RelationalUserPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

const infrastructurePersistenceModule = RelationalUserPersistenceModule;

@Module({
  imports: [
    // import modules, etc.
    infrastructurePersistenceModule,
    FilesModule,
    AuditLogsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersCronService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
