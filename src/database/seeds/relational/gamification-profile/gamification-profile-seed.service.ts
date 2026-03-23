import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationProfileEntity } from '../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

const SEED_PROFILES = [
  {
    email: 'admin@example.com',
    username: 'super-admin',
    totalXp: 1500,
    currentMonthlyXp: 300,
    currentYearlyXp: 1200,
    gratitudeTokens: 5,
  },
  {
    email: 'ana.mod@example.com',
    username: 'ana-moderadora',
    totalXp: 980,
    currentMonthlyXp: 180,
    currentYearlyXp: 750,
    gratitudeTokens: 5,
  },
  {
    email: 'carlos.mod@example.com',
    username: 'carlos-moderador',
    totalXp: 740,
    currentMonthlyXp: 120,
    currentYearlyXp: 600,
    gratitudeTokens: 3,
  },
  {
    email: 'joao.silva@example.com',
    username: 'joao-silva',
    totalXp: 320,
    currentMonthlyXp: 80,
    currentYearlyXp: 320,
    gratitudeTokens: 5,
  },
  {
    email: 'maria.souza@example.com',
    username: 'maria-souza',
    totalXp: 210,
    currentMonthlyXp: 50,
    currentYearlyXp: 210,
    gratitudeTokens: 4,
  },
];

@Injectable()
export class GamificationProfileSeedService {
  constructor(
    @InjectRepository(GamificationProfileEntity)
    private profileRepository: Repository<GamificationProfileEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const count = await this.profileRepository.count();
    if (count > 0) return;

    for (const seed of SEED_PROFILES) {
      const user = await this.userRepository.findOne({
        where: { email: seed.email },
      });

      if (!user) continue;

      await this.profileRepository.save(
        this.profileRepository.create({
          userId: user.id,
          username: seed.username,
          totalXp: seed.totalXp,
          currentMonthlyXp: seed.currentMonthlyXp,
          currentYearlyXp: seed.currentYearlyXp,
          gratitudeTokens: seed.gratitudeTokens,
        }),
      );
    }
  }
}
