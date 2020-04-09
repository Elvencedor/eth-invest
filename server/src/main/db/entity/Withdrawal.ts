import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from './User'

export enum WithdrawalStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

@Entity()
export class Withdrawal {
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

  // USD amount
  @Column()
  amount!:string

  @Column({
    nullable: true,
    unique: false,
    default: null
  })
  target!:string

  @Column({
    nullable: true,
    unique: true,
    default: null
  })
  txid!:string

  @Column({
    nullable: true
  })
  beneficiaryId!:string

  @ManyToOne(type => User, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true
  })
  @JoinColumn({name: 'beneficiaryId', referencedColumnName: 'id'})
  beneficiary!: User

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING
  })
  status!:WithdrawalStatus

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}