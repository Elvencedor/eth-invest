import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { User } from './User'

@Entity()
export class Token {
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
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user!: User

  @Column({
    nullable: false,
    unique: true
  })
  token!:string

  @Column({
    nullable: true
  })
  meta!:string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}