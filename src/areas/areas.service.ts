import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from '@/entities';
import { RedisService } from '@/config/redis.service';

@Injectable()
export class AreasService {
  private readonly logger = new Logger(AreasService.name);
  private readonly CACHE_KEY = 'areas:all';

  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    private redisService: RedisService,
  ) {}

  async findAll() {
    return this.areaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.areaRepository.findOne({
      where: { id },
    });
  }

  async create(createAreaData: any) {
    const area = this.areaRepository.create(createAreaData);
    const savedArea = await this.areaRepository.save(area);

    await this.invalidateAreasCache();

    return savedArea;
  }

  async update(id: string, updateAreaData: any) {
    await this.areaRepository.update(id, updateAreaData);

    await this.invalidateAreasCache();

    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.areaRepository.delete(id);

    await this.invalidateAreasCache();

    return result;
  }

  private async invalidateAreasCache() {
    try {
      await this.redisService.del(this.CACHE_KEY);
      this.logger.log('Areas cache invalidated');
    } catch (error) {
      this.logger.warn('Failed to invalidate areas cache:', error.message);
    }
  }

  private async refreshAreasCache() {
    try {
      const areas = await this.areaRepository.find();
      await this.redisService.set(this.CACHE_KEY, JSON.stringify(areas), 300);
      this.logger.log('Areas cache refreshed proactively');
    } catch (error) {
      this.logger.warn('Failed to refresh areas cache:', error.message);
    }
  }
}
