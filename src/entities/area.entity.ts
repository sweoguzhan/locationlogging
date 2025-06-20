import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Log } from './log.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  @Index()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text')
  boundary: string; // WKT formatı: POLYGON((lng lat, lng lat, ...))

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @OneToMany(() => Log, log => log.area)
  logs: Log[];
}
