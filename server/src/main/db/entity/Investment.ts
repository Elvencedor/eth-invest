import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Plan } from './Plan'
import { User } from './User'

export enum InvestmentStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
}


@Entity()
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id!:string

  @Column({
    nullable: false
  })
  userId!:string

  @ManyToOne(type => User, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true
  })
  @JoinColumn({name: 'userId', referencedColumnName: 'id'})
  user!: User

  @Column({
    nullable: false
  })
  planId!:string

  @ManyToOne(type => Plan, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true
  })
  @JoinColumn({name: 'planId', referencedColumnName: 'id'})
  plan!: Plan

  @Column({
    nullable: false,
  })
  amount!:string

  @Column({
    nullable: false,
  })
  duration!:string

  @Column({
    nullable: false,
  })
  percentage!:string

  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.RUNNING
  })
  status!:InvestmentStatus

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}