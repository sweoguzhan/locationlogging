import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Location, Log } from '../entities';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async create(createUserData: any) {
    this.logger.log(`Creating new user: ${createUserData.email}`);

    const user = this.userRepository.create(createUserData);
    const savedResults = await this.userRepository.save(user);
    const savedUser = Array.isArray(savedResults) ? savedResults[0] : savedResults;

    this.logger.log(`✅ User created with ID: ${savedUser.id}`);
    return savedUser;
  }

  async findAll() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt']
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserData: any) {
    this.logger.log(`Updating user: ${id}`);

    const user = await this.findOne(id);

    await this.userRepository.update(id, updateUserData);

    this.logger.log(`✅ User updated: ${id}`);
    return this.findOne(id);
  }

  async remove(id: string) {
    this.logger.log(`Deleting user: ${id}`);

    const user = await this.findOne(id);

    const result = await this.userRepository.delete(id);

    this.logger.log(`✅ User deleted: ${id}`);
    return { message: `User ${user.name} deleted successfully` };
  }

  async getUserLocations(userId: string) {
    await this.findOne(userId);

    return this.locationRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: 100, // Son 100 konumu almak için,pagination eklenebilir ancak casede zaten yoktu bu keyfi yaptım
    });
  }

  async getUserLogs(userId: string) {
    await this.findOne(userId);

    return this.logRepository.find({
      where: { userId },
      relations: ['area'],
      order: { entryTime: 'DESC' },
      take: 50,
    });
  }
}
