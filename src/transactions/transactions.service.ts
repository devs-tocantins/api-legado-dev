import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Transaction } from './domain/transaction';

@Injectable()
export class TransactionsService {
  constructor(
    // Dependencies here
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.transactionRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      profile: createTransactionDto.profile,
      category: createTransactionDto.category,
      amount: createTransactionDto.amount,
      description: createTransactionDto.description,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.transactionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Transaction['id']) {
    return this.transactionRepository.findById(id);
  }

  findByIds(ids: Transaction['id'][]) {
    return this.transactionRepository.findByIds(ids);
  }

  async update(
    id: Transaction['id'],

    updateTransactionDto: UpdateTransactionDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.transactionRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...(updateTransactionDto.profile && {
        profile: updateTransactionDto.profile,
      }),
      ...(updateTransactionDto.category && {
        category: updateTransactionDto.category,
      }),
      ...(updateTransactionDto.amount !== undefined && {
        amount: updateTransactionDto.amount,
      }),
      ...(updateTransactionDto.description !== undefined && {
        description: updateTransactionDto.description,
      }),
    });
  }

  remove(id: Transaction['id']) {
    return this.transactionRepository.remove(id);
  }

  findByProfileId(profileId: string, paginationOptions: IPaginationOptions) {
    return this.transactionRepository.findByProfileId(
      profileId,
      paginationOptions,
    );
  }
}
