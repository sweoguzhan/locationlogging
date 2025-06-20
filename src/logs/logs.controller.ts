import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a manual log entry' })
  @ApiResponse({ status: 201, description: 'Log created successfully' })
  create(@Body() createLogDto: any) {
    return this.logsService.create(createLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all area entry logs with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of logs',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        }
      }
    }
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.logsService.findAllPaginated(paginationDto);
  }


  @Get('user/:userId')
  @ApiOperation({ summary: 'Get logs for a specific user with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated user logs' })
  findByUser(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.logsService.findByUserPaginated(userId, paginationDto);
  }

  @Get('area/:areaId')
  @ApiOperation({ summary: 'Get logs for a specific area' })
  @ApiResponse({ status: 200, description: 'Area logs' })
  findByArea(@Param('areaId') areaId: string) {
    return this.logsService.findByArea(areaId);
  }

  @Get('user/:userId/area/:areaId')
  @ApiOperation({ summary: 'Get logs for a specific user in a specific area' })
  @ApiResponse({ status: 200, description: 'Filtered logs' })
  findByUserAndArea(
    @Param('userId') userId: string,
    @Param('areaId') areaId: string,
  ) {
    return this.logsService.findByUserAndArea(userId, areaId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get logs within date range' })
  @ApiQuery({ name: 'startDate', type: 'string', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', type: 'string', description: 'End date (ISO string)' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.logsService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log by ID' })
  @ApiResponse({ status: 200, description: 'Log found' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete log by ID' })
  @ApiResponse({ status: 200, description: 'Log deleted successfully' })
  remove(@Param('id') id: string) {
    return this.logsService.remove(id);
  }
}
