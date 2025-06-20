import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Area, Location, Log } from '@/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres123',
        database: 'location_logging',
        entities: [User, Area, Location, Log],
        synchronize: false, // init.sql ile tablolar oluşturuluyor
        logging: process.env.NODE_ENV === 'development',
        ssl: false,
        connectTimeoutMS: 10000,
        acquireTimeoutMS: 10000,
        timeout: 10000,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Area, Location, Log]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
