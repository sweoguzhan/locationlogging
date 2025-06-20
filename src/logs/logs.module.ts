import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log, User, Area } from '@/entities';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log, User, Area])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
