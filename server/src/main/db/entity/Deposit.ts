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

export enum DepositStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum assets{
  BTC = 'btc',
  ETH = 'eth'
}

@Entity()
export class Deposit {
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

  // asset amount
  @Column({
    nullable: true,
    enum: assets,
    default: assets.ETH
  })
  assetAmount!:string

  @Column({
    nullable: true,
    unique: true,
    default: null
  })
  txid!:string

  @Column({
    nullable: true
  })
  benefactorId!:string

  @ManyToOne(type => User, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true
  })
  @JoinColumn({name: 'benefactorId', referencedColumnName: 'id'})
  benefactor!: User

  @Column({
    type: 'enum',
    enum: DepositStatus,
    default: DepositStatus.PENDING
  })
  status!:DepositStatus

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}