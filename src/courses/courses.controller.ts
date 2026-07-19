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
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ReviewCourseDto } from './dto/review-course.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Course } from './domain/course';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCoursesDto } from './dto/find-all-courses.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiCreatedResponse({
    type: Course,
  })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Course),
  })
  async findPending(
    @Query() query: FindAllCoursesDto,
  ): Promise<InfinityPaginationResponseDto<Course>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.coursesService.findPendingWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Course),
  })
  async findAll(
    @Query() query: FindAllCoursesDto,
  ): Promise<InfinityPaginationResponseDto<Course>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.coursesService.findVerifiedWithPagination({
        trackItemId: query?.trackItemId,
        paginationOptions: {
          page,
          limit,
        },
      }),
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
    type: Course,
  })
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.moderator)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Course,
  })
  review(
    @Param('id') id: string,
    @Body() reviewCourseDto: ReviewCourseDto,
    @Request() req,
  ) {
    return this.coursesService.review(id, reviewCourseDto, req.user.id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Course,
  })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
