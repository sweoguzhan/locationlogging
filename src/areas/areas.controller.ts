import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AreasService } from './areas.service';

@ApiTags('areas')
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new geographical area' })
  @ApiResponse({ status: 201, description: 'Area created successfully' })
  create(@Body() createAreaDto: any) {
    return this.areasService.create(createAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all areas' })
  @ApiResponse({ status: 200, description: 'List of all areas' })
  findAll() {
    return this.areasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiResponse({ status: 200, description: 'Area found' })
  @ApiResponse({ status: 404, description: 'Area not found' })
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update area by ID' })
  @ApiResponse({ status: 200, description: 'Area updated successfully' })
  update(@Param('id') id: string, @Body() updateAreaDto: any) {
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete area by ID' })
  @ApiResponse({ status: 200, description: 'Area deleted successfully' })
  remove(@Param('id') id: string) {
    return this.areasService.remove(id);
  }
} 