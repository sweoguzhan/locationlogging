import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Save a new location' })
  @ApiResponse({ status: 201, description: 'Location saved successfully' })
  create(@Body() createLocationDto: any) {
    return this.locationsService.create(createLocationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all locations for a user' })
  @ApiResponse({ status: 200, description: 'List of user locations' })
  findAllByUser(@Param('userId') userId: string) {
    return this.locationsService.findAllByUser(userId);
  }

  @Get('user/:userId/last')
  @ApiOperation({ summary: 'Get last location of a user' })
  @ApiResponse({ status: 200, description: 'Last location' })
  getLastLocation(@Param('userId') userId: string) {
    return this.locationsService.getLastLocation(userId);
  }

  @Get('user/:userId/date-range')
  @ApiOperation({ summary: 'Get locations within date range' })
  @ApiQuery({ name: 'startDate', type: 'string', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', type: 'string', description: 'End date (ISO string)' })
  findByDateRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.locationsService.findByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location found' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }
} 