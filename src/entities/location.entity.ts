import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  @Index()
  userId: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @CreateDateColumn({ name: 'timestamp' })
  @Index()
  timestamp: Date;

  // Relations
  @ManyToOne(() => User, user => user.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
} 