 
import { MigrationInterface, QueryRunner } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { PlanStatus } from '../entity/Plan'

export class PlanSeed1515769694451 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    const data = [
      {
        id: uuidv4(),
        name: 'Regular',
        duration: 90,
        percentage: 9,
        minimumAmount: '200',
        status: PlanStatus.ACTIVE
      },
      {
        id: uuidv4(),
        name: 'Pro',
        duration: 180,
        percentage: 12,
        minimumAmount: '500',
        status: PlanStatus.ACTIVE
      },
      {
        id: uuidv4(),
        name: 'Platinum',
        duration: 365,
        percentage: 15,
        minimumAmount: '1000',
        status: PlanStatus.ACTIVE
      }
    ]
    await queryRunner
      .manager
      .createQueryBuilder()
      .insert()
      .into('Plan')
      .values(data)
      .execute()

  }

  async down(queryRunner: QueryRunner): Promise<any> { 
    // reverts things made in "up" method
  }
}