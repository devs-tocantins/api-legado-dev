import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Transaction } from './domain/transaction';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTransactionsDto } from './dto/find-all-transactions.dto';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'transactions',
  version: '1',
})
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiCreatedResponse({
    type: Transaction,
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get('me')
  @ApiOkResponse({
    type: InfinityPaginationResponse(Transaction),
  })
  async findMine(
    @Query() query: FindAllTransactionsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Transaction>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 50) {
      limit = 50;
    }

    const profile = await this.gamificationProfilesService.findByUserId(
      req.user.id,
    );
    if (!profile) {
      throw new NotFoundException('Perfil de gamificação não encontrado.');
    }

    return infinityPagination(
      await this.transactionsService.findByProfileId(profile.id, {
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Transaction),
  })
  async findAll(
    @Query() query: FindAllTransactionsDto,
  ): Promise<InfinityPaginationResponseDto<Transaction>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.transactionsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Transaction,
  })
  findById(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Transaction,
  })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
