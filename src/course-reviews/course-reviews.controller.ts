import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CourseReview } from './domain/course-review';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCourseReviewsDto } from './dto/find-all-course-reviews.dto';

@ApiTags('Coursereviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'course-reviews',
  version: '1',
})
export class CourseReviewsController {
  constructor(private readonly courseReviewsService: CourseReviewsService) {}

  @Post()
  @ApiCreatedResponse({
    type: CourseReview,
  })
  create(@Body() createCourseReviewDto: CreateCourseReviewDto, @Request() req) {
    return this.courseReviewsService.create(createCourseReviewDto, req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(CourseReview),
  })
  async findAll(
    @Query() query: FindAllCourseReviewsDto,
  ): Promise<InfinityPaginationResponseDto<CourseReview>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.courseReviewsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get('by-course/:courseId')
  @ApiParam({
    name: 'courseId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: [CourseReview],
  })
  findByCourseId(@Param('courseId') courseId: string) {
    return this.courseReviewsService.findByCourseId(courseId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: CourseReview,
  })
  findById(@Param('id') id: string) {
    return this.courseReviewsService.findById(id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.courseReviewsService.remove(id);
  }
}
