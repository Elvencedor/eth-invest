import {Request, Response} from 'express'
import { getRepository, Like } from 'typeorm'
import {respond} from '../../../respond'
import { User } from '../../../../db/entity/User'
import { Deposit } from '../../../../db/entity/Deposit'
import { Withdrawal } from '../../../../db/entity/Withdrawal'
import { Investment } from '../../../../db/entity/Investment'
import { Plan } from '../../../../db/entity/Plan'
import { AppError } from '../../../errors/AppError'

export async function index (req: Request, res: Response) {
  const userRepo = getRepository(User)
  const depositRepo = getRepository(Deposit)
  const withdrawalRepo = getRepository(Withdrawal)
  const investmentRepo = getRepository(Investment)
  const planRepo = getRepository(Plan)

 

  try {
    const stats = await Promise.all([
      userRepo.findAndCount(),
      depositRepo.findAndCount(),
      withdrawalRepo.findAndCount(),
      investmentRepo.findAndCount(),
      planRepo.findAndCount(),
    ])
  
    respond(res, 200, null, {
      userCount: stats[0][1],
      depositCount: stats[1][1],
      withdrawalCount: stats[2][1],
      investmentCount: stats[3][1],
      planCount: stats[4][1]
    })
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}
