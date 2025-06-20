import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private isConnected = false;
  private circuitBreakerOpen = false;
  private lastFailureTime = 0;
  private readonly circuitBreakerTimeout = 60000;

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private initializeRedis() {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      this.circuitBreakerOpen = false;
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      this.circuitBreakerOpen = true;
      this.lastFailureTime = Date.now();
      this.logger.error('Redis connection error:', error.message);
    });
  }

  private canExecute(): boolean {
    if (!this.circuitBreakerOpen) return true;

    const now = Date.now();
    if (now - this.lastFailureTime > this.circuitBreakerTimeout) {
      this.circuitBreakerOpen = false;
      return true;
    }

    return false;
  }

  async get(key: string): Promise<string | null> {
    if (!this.canExecute()) return null;

    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.warn(`Failed to get key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.canExecute()) return false;

    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.warn(`Failed to set key ${key}:`, error.message);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.canExecute()) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to delete key ${key}:`, error.message);
      return false;
    }
  }
  getHealthStatus() {
    return {
      connected: this.isConnected,
      circuitBreakerOpen: this.circuitBreakerOpen,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
