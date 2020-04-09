import { getRepository } from 'typeorm'
import { Plan, PlanStatus } from '../../db/entity/Plan'
import { AppError } from '../errors/AppError'

export async function fetchPlans ():Promise<Plan[]> {
  const planRepo = getRepository(Plan)
  const plans = await planRepo.find({
    where: [
      { status: PlanStatus.ACTIVE }
    ],
    order: { duration: 'ASC' }
  })

  return new Promise((resolve, reject) => {
    if (plans) {
      resolve(plans)
    } else reject(new AppError({
      message: 'Plan not found!',
      status: 403
    }))
  })
}
