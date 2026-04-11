import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { GamificationProfileSeedService } from './gamification-profile/gamification-profile-seed.service';
import { ActivitySeedService } from './activity/activity-seed.service';
import { BadgeSeedService } from './badge/badge-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run in dependency order
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(GamificationProfileSeedService).run();
  await app.get(ActivitySeedService).run();
  await app.get(BadgeSeedService).run();

  await app.close();
};

void runSeed();
