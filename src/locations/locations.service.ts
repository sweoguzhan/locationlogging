import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Queue } from 'bull';
import { Location, User, Area, Log } from '@/entities';

interface CreateLocationDto {
  userId: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    @InjectQueue('location-processing') private locationQueue: Queue,
  ) {}

  async findAllByUser(userId: string) {
    return this.locationRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.locationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(createLocationDto: CreateLocationDto) {
     const newLocation = this.locationRepository.create(createLocationDto);
     const savedResults = await this.locationRepository.save(newLocation);
     const savedLocation = Array.isArray(savedResults) ? savedResults[0] : savedResults;

    try {
      const queuePromise = this.locationQueue.add('process-location', {
        locationId: savedLocation.id,
        userId: createLocationDto.userId,
        latitude: createLocationDto.latitude,
        longitude: createLocationDto.longitude,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout after 5 seconds')), 5000)
      );

      await Promise.race([queuePromise, timeoutPromise]);
      this.logger.log(`✅ Location ${savedLocation.id} queued for processing`);
    } catch (queueError) {
      this.logger.error(`❌ Failed to queue location ${savedLocation.id}:`, queueError.message);

      this.logger.warn(`🔄 Falling back to synchronous processing for location ${savedLocation.id}`);
      await this.procesLocationSync(savedLocation.id, createLocationDto);

      await this.markLocationForRetry(savedLocation.id, queueError.message);
    }

    return {
      id: savedLocation.id,
      message: 'Location received and queued for processing',
      timestamp: savedLocation.timestamp,
    };
  }

  private async markLocationForRetry(locationId: string, error: string) {
    try {
      this.logger.warn(`Location ${locationId} marked for retry due to: ${error}`);

      // TODO: İşleme durumunu izlemek için veritabanı alanı ekleyebilirim ancak gerek duyulmuyordu case üzerinde.
    } catch (updateError) {
      this.logger.error(`Failed to mark location for retry:`, updateError);
    }
  }

  private async procesLocationSync(locationId: string, locationData: CreateLocationDto) {
    try {
      this.logger.log(`Processing location synchronously: ${locationId}`);

      const areas = await this.areaRepository.find();
      this.logger.debug(`Areas loaded from database for sync processing: ${areas.length}`);

      for (const area of areas) {
        const isInside = this.isPointInPolygon(locationData.latitude, locationData.longitude, area.boundary);

        if (isInside) {
          this.logger.log(`Point is INSIDE area: ${area.name} (sync processing)`);

          const recentLogCount = await this.logRepository
            .createQueryBuilder('log')
            .where('log.userId = :userId', { userId: locationData.userId })
            .andWhere('log.areaId = :areaId', { areaId: area.id })
            .andWhere('log.entryTime > NOW() - INTERVAL \'10 minutes\'')
            .getCount();

          if (recentLogCount === 0) {
            const newLog = this.logRepository.create({
              userId: locationData.userId,
              areaId: area.id,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });
            await this.logRepository.save(newLog);

            this.logger.log(`Sync processing: User entered area ${area.name} (Log created)`);
          } else {
            this.logger.log(`Sync processing: User already in area ${area.name} (Skip)`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Sync processing failed for location ${locationId}:`, error);
    }
  }

  private isPointInPolygon(lat: number, lng: number, boundary: string): boolean {
    try {
      const geoJson = JSON.parse(boundary);
      if (geoJson.type !== 'Polygon' || !geoJson.coordinates) {
        return false;
      }
      const coords = geoJson.coordinates[0];
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

  async getLastLocation(userId: string) {
    return this.locationRepository.findOne({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date) {
    return this.locationRepository.find({
      where: {
        userId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
  }
}
