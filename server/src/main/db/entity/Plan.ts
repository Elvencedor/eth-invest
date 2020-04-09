import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

export enum PlanStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!:string

  @Column({
    nullable: false,
    unique: true
  })
  name!:string

  @Column()
  duration!:number

  @Column()
  percentage!:number

  @Column()
  minimumAmount!:string

  @Column({
    type: 'enum',
    enum: PlanStatus,
    default: PlanStatus.INACTIVE
  })
  status!:PlanStatus

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!:Date

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt!:Date
}