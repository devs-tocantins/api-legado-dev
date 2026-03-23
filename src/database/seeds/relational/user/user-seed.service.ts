import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async run() {
    const countAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.admin,
        },
      },
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password,
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }

    const countModerator = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.moderator,
        },
      },
    });

    if (!countModerator) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save([
        this.repository.create({
          firstName: 'Ana',
          lastName: 'Moderadora',
          email: 'ana.mod@example.com',
          password,
          role: {
            id: RoleEnum.moderator,
            name: 'Moderator',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
        this.repository.create({
          firstName: 'Carlos',
          lastName: 'Moderador',
          email: 'carlos.mod@example.com',
          password,
          role: {
            id: RoleEnum.moderator,
            name: 'Moderator',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      ]);
    }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save([
        this.repository.create({
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@example.com',
          password,
          role: {
            id: RoleEnum.user,
            name: 'User',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
        this.repository.create({
          firstName: 'Maria',
          lastName: 'Souza',
          email: 'maria.souza@example.com',
          password,
          role: {
            id: RoleEnum.user,
            name: 'User',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      ]);
    }
  }
}
