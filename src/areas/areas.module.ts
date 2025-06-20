import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from '@/entities';
import { AreasController } from './areas.controller';
import { AreasService } from './areas.service';
import { RedisModule } from '@/config/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Area]),
    RedisModule,
  ],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService],
})
export class AreasModule {}
