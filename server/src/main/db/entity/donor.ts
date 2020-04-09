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

  @Entity()
  export class donor{
      @PrimaryGeneratedColumn('uuid')
      id!: string

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
      @JoinColumn({name: 'userId',referencedColumnName: 'id'})
      user!: User

      @Column({nullable: false})
      amount!: Number

      @Column({nullable: false})
      email!: string

      @Column({nullable: false})
      reference!: string

      @CreateDateColumn({ type: 'timestamp' })
      createdAt!:Date
    
      @UpdateDateColumn({ type: 'timestamp', default: null })
      updatedAt!:Date


  }