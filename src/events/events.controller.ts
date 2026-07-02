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
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReviewEventDto } from './dto/review-event.dto';
import { FindAllEventsDto } from './dto/find-all-events.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Event } from './domain/event';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { ALLOWED_REMINDER_MINUTES } from './events-ics.service';

@ApiTags('Events')
@Controller({
  path: 'events',
  version: '1',
})
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: Event,
  })
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Event),
    description: 'Lista pública da agenda: apenas eventos aprovados e futuros.',
  })
  async findAll(
    @Query() query: FindAllEventsDto,
  ): Promise<InfinityPaginationResponseDto<Event>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.eventsService.findAllPublic({
        paginationOptions: { page, limit },
        filters: {
          category: query?.category,
          modality: query?.modality,
        },
      }),
      { page, limit },
    );
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: InfinityPaginationResponse(Event),
  })
  async findMine(
    @Query() query: FindAllEventsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Event>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.eventsService.findMine(req.user.id, { page, limit }),
      { page, limit },
    );
  }

  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Event),
  })
  async findPending(
    @Query() query: FindAllEventsDto,
  ): Promise<InfinityPaginationResponseDto<Event>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.eventsService.findPending({ page, limit }),
      { page, limit },
    );
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Event),
    description: 'Lista todos os eventos, em qualquer status.',
  })
  async findAllAdmin(
    @Query() query: FindAllEventsDto,
  ): Promise<InfinityPaginationResponseDto<Event>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.eventsService.findAllAdmin({ page, limit }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Event,
  })
  findById(@Param('id') id: string) {
    return this.eventsService.findPublicDetail(id);
  }

  @Get(':id/manage')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Event,
    description:
      'Detalhe do evento em qualquer status, visível apenas para o organizador ou admin.',
  })
  findForManagement(@Param('id') id: string, @Request() req) {
    const isAdmin = Number(req.user?.role?.id) === RoleEnum.admin;
    return this.eventsService.findForManagement(id, req.user.id, isAdmin);
  }

  @Get(':id/ics')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'reminderMinutes',
    required: false,
    enum: ALLOWED_REMINDER_MINUTES,
  })
  async downloadIcs(
    @Param('id') id: string,
    @Query('reminderMinutes') reminderMinutes: string | undefined,
    @Res() res: Response,
  ) {
    const { filename, content } = await this.eventsService.generateIcs(
      id,
      reminderMinutes ? Number(reminderMinutes) : 60,
    );

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Post(':id/subscribe')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async subscribe(@Param('id') id: string, @Request() req) {
    await this.eventsService.subscribe(id, req.user.id);
  }

  @Delete(':id/subscribe')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async unsubscribe(@Param('id') id: string, @Request() req) {
    await this.eventsService.unsubscribe(id, req.user.id);
  }

  @Get(':id/subscription')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async getSubscription(@Param('id') id: string, @Request() req) {
    const subscribed = await this.eventsService.isSubscribed(id, req.user.id);
    return { subscribed };
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Event,
  })
  cancel(@Param('id') id: string, @Request() req) {
    const canManageAny =
      Number(req.user?.role?.id) === RoleEnum.admin ||
      Number(req.user?.role?.id) === RoleEnum.moderator;
    return this.eventsService.cancel(id, req.user.id, canManageAny);
  }

  @Patch(':id/review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Event,
  })
  review(
    @Param('id') id: string,
    @Body() reviewEventDto: ReviewEventDto,
    @Request() req,
  ) {
    return this.eventsService.review(id, reviewEventDto, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Event,
  })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    const isAdmin = Number(req.user?.role?.id) === RoleEnum.admin;
    return this.eventsService.update(id, updateEventDto, req.user.id, isAdmin);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
