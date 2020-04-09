import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm'
import { User } from './User'

@Entity()
export class Referral {
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
  referrerId!:string

  @ManyToOne(type => User, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true
  })
  @JoinColumn({name: 'referrerId', referencedColumnName: 'id'})
  referrer!: User

  // USD
  @Column({ nullable: false, default: '0' })
  bonus!:string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}