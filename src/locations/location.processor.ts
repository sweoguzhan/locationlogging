import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Area, Log } from '../entities';
import { RedisService } from '../config/redis.service';

@Injectable()
@Processor('location-processing')
export class LocationProcessor {
  private readonly logger = new Logger(LocationProcessor.name);

  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private redisService: RedisService,
  ) {}

  @Process('process-location')
  async handleLocationProcessing(job: Job) {
    const { locationId, userId, latitude, longitude } = job.data;

    this.logger.log(`Processing location: ${locationId} for user: ${userId}`);

    try {
      const areas = await this.getAreasWithCache();

      this.logger.log(`Found ${areas.length} areas to check`);

      for (const area of areas) {
        this.logger.debug(`Checking area: ${area.name}`);
        const isInside = this.isPointInPolygon(latitude, longitude, area.boundary);

        this.logger.log(`Point [${longitude}, ${latitude}] is ${isInside ? 'INSIDE' : 'OUTSIDE'} area: ${area.name}`);

        if (isInside) {
          const now = new Date();
          const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

          this.logger.log(`Current time (UTC): ${now.toISOString()}`);
          this.logger.log(`Ten minutes ago (UTC): ${tenMinutesAgo.toISOString()}`);

          const recentLogCount = await this.logRepository
            .createQueryBuilder('log')
            .where('log.userId = :userId', { userId })
            .andWhere('log.areaId = :areaId', { areaId: area.id })
            .andWhere('log.entryTime > NOW() - INTERVAL \'10 minutes\'')
            .getCount();

          this.logger.log(`Recent logs within 10 minutes: ${recentLogCount}`);

          const shouldCreateLog = recentLogCount === 0;

          this.logger.log(`Should create log? ${shouldCreateLog}`);

          if (shouldCreateLog) {
            const newLog = this.logRepository.create({
              userId,
              areaId: area.id,
              latitude,
              longitude,
            });
            await this.logRepository.save(newLog);

            this.logger.log(`User ${userId} entered area: ${area.name} (New entry logged)`);
          } else {
            this.logger.log(`User ${userId} already in area: ${area.name} (Skip - within 10 minutes)`);
          }
        }
      }

    } catch (error) {
      this.logger.error(`Error processing location ${locationId}:`, error);
      throw error;
    }
  }

  private isPointInPolygon(lat: number, lng: number, boundary: any): boolean {
    try {
      // boundary is already an object, no need to parse
      const geoJson = typeof boundary === 'string' ? JSON.parse(boundary) : boundary;

      if (geoJson.type !== 'Polygon' || !geoJson.coordinates) {
        this.logger.error('Invalid GeoJSON format');
        return false;
      }

      const coords = geoJson.coordinates[0];

      this.logger.debug(`Checking point [${lng}, ${lat}] against polygon with ${coords.length} vertices`);

      return this.pointInPolygon([lng, lat], coords);
    } catch (error) {
      this.logger.error('Error parsing boundary:', error);
      return false;
    }
  }

  private pointInPolygon(point: number[], polygon: number[][]): boolean {
    const x = point[0];
    const y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  private async getAreasWithCache(): Promise<Area[]> {
    const cacheKey = 'areas:all';
    const cacheTTL = 300; // 5 minutes

    try {
      const cachedAreas = await this.redisService.get(cacheKey);
      if (cachedAreas) {
        this.logger.debug('Areas loaded from Redis cache');
        return JSON.parse(cachedAreas);
      }
    } catch (error) {
      this.logger.warn('⚠️ Redis cache failed, falling back to database');
    }

    try {
      const areas = await this.areaRepository.find();
      this.logger.debug('Areas loaded from database');

      this.redisService.set(cacheKey, JSON.stringify(areas), cacheTTL)
        .catch(err => this.logger.warn('Failed to cache areas:', err.message));

      return areas;
    } catch (dbError) {
      this.logger.error('Database fallback failed:', dbError);
      throw new Error('Unable to load areas from cache or database');
    }
  }
}
