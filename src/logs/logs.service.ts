import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Log } from '@/entities';
import { PaginationDto, PaginatedResponse } from '@/common/dto/pagination.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResponse<Log>> {
    const { page = 1, limit = 10, sortBy = 'entryTime', sortOrder = 'DESC' } = paginationDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('log.area', 'area');

    if (sortBy) {
      const allowedSortFields = ['entryTime', 'latitude', 'longitude'];
      if (allowedSortFields.includes(sortBy)) {
        queryBuilder.orderBy(`log.${sortBy}`, sortOrder);
      } else {
        queryBuilder.orderBy('log.entryTime', 'DESC');
      }
    }

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    console.log(`📄 Pagination: Page ${page}, Limit ${limit}, Total ${total}, Returned ${data.length}`);

    return new PaginatedResponse(data, total, page, limit);
  }

  async findByUserPaginated(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Log>> {
    const { page = 1, limit = 10, sortBy = 'entryTime', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('log.area', 'area')
      .where('log.userId = :userId', { userId });

    const allowedSortFields = ['entryTime', 'latitude', 'longitude'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`log.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('log.entryTime', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    console.log(`📄 User ${userId} Pagination: Page ${page}, Total ${total}, Returned ${data.length}`);

    return new PaginatedResponse(data, total, page, limit);
  }

  async findByArea(areaId: string) {
    return this.logRepository.find({
      where: { areaId },
      relations: ['user', 'area'],
      order: { entryTime: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.logRepository.find({
      where: {
        entryTime: Between(startDate, endDate),
      },
      relations: ['user', 'area'],
      order: { entryTime: 'DESC' },
    });
  }

  async findByUserAndArea(userId: string, areaId: string) {
    return this.logRepository.find({
      where: {
        userId,
        areaId,
      },
      relations: ['user', 'area'],
      order: { entryTime: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.logRepository.findOne({
      where: { id },
      relations: ['user', 'area'],
    });
  }

  async create(createLogData: any) {
    const log = this.logRepository.create(createLogData);
    return this.logRepository.save(log);
  }

  async remove(id: string) {
    const result = await this.logRepository.delete(id);
    return result.affected > 0;
  }

}
