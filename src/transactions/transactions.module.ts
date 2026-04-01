import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RelationalTransactionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalTransactionPersistenceModule,
    GamificationProfilesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService, RelationalTransactionPersistenceModule],
})
export class TransactionsModule {}
