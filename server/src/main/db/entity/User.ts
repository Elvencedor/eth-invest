import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

export enum UserStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  DELETED = 'deleted',
  BLOCKED = 'blocked'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!:string

  @Column({
    nullable: false,
    unique: true
  })
  email!:string

  @Column({
    nullable: false,
    unique: true
  })
  username!:string

  @Column({ select: false })
  passhash!:string

  @Column({ nullable: false })
  fullName!:string

  // USD
  @Column({ nullable: false, default: '0' })
  balance!:string

  // USD
  @Column({ nullable: false, default: '0' })
  bonusBalance!:string

  @Column({ nullable: true })
  btcAddress!:string

  @Column({ nullable: true })
  tfaSecret!:string

  @Column({ nullable: false, default: false })
  tfaEnabled!:boolean

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!:UserRole

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE
  })
  status!:UserStatus

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}