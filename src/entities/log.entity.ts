import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Area } from './area.entity';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  @Index()
  userId: string;

  @Column('text')
  @Index()
  areaId: string;

  @CreateDateColumn({ name: 'entryTime' })
  @Index()
  entryTime: Date;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  // Relations
  @ManyToOne(() => User, user => user.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Area, area => area.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'areaId' })
  area: Area;
} 