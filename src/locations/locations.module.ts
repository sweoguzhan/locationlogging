import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location, User, Area, Log } from '@/entities';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationProcessor } from './location.processor';
import { RedisModule } from '@/config/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, User, Area, Log]),
    BullModule.registerQueue({
      name: 'location-processing',
    }),
    RedisModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService, LocationProcessor],
  exports: [LocationsService],
})
export class LocationsModule {}
