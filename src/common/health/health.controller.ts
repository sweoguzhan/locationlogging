import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from '@/config/redis.service';



///System Health Check

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'System health status' })
  async getHealth() {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      const dbStatus = 'healthy';

      const redisStatus = this.redis.getHealthStatus();
      await this.redis.set('health_check', 'ok', 10);

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services: {
          database: {
            status: dbStatus,
            connection: 'postgresql',
          },
          redis: {
            status: redisStatus.connected ? 'healthy' : 'unhealthy',
            circuitBreaker: redisStatus.circuitBreakerOpen ? 'open' : 'closed',
          },
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: { status: 'unhealthy' },
          redis: { status: 'unknown' },
        },
      };
    }
  }
}
