import BigNumber from 'bignumber.js'
import { getRepository, getConnection, Like } from 'typeorm'
import { User } from '../../db/entity/User'
import { Investment, InvestmentStatus } from '../../db/entity/Investment';
import { AppError } from '../errors/AppError'
import { InvestmentPayload } from '../../../ts/types'
import { Plan } from '../../db/entity/Plan'
import { Pagination, PaginationOptionsInterface } from '../pagination'
import moment = require('moment')

export async function fetchInvestments (query:any, options: PaginationOptionsInterface):Promise<Pagination<Investment>> {
  const searchQuery = query.search || ''
  const investmentRepo = getRepository(Investment)
  const dynamicWhere = {
    userId: query.userId,
    id: Like('%' + searchQuery + '%')
  }

  if (!searchQuery) delete dynamicWhere.id

  const [investments, total] = await investmentRepo.findAndCount({
    where: [dynamicWhere],
    skip: options.limit * (options.page - 1),
    take: options.limit,
    order: {
      createdAt: 'DESC'
    }
  })

  return new Promise((resolve, reject) => {
    if (investments) {
      resolve(new Pagination<Investment>({
        results: investments,
        current: options.page,
        perPage: options.limit,
        total: total,
      }, options))
    } else reject(new AppError({
      message: 'Subscription not found!',
      status: 403
    }))
  })
}

export async function fetchRunningInvestments (query:any):Promise<Investment[]> {
  const investmentRepo = getRepository(Investment)
  const investments = await investmentRepo.find({
    where: [
      { userId: query.userId, status: InvestmentStatus.RUNNING },
    ]
  })

  return new Promise((resolve, reject) => {
    if (investments) {
      resolve(investments)
    } else reject(new AppError({
      message: 'Subscription not found!',
      status: 403
    }))
  })
}

export async function createInvestment (fields: InvestmentPayload):Promise<any> {
  return new Promise((resolve, reject) => {
    getConnection().transaction('SERIALIZABLE', async txEntityManager => {
      const user:User|undefined = await txEntityManager.findOne(User, fields.userId)
      const plan:Plan|undefined = await txEntityManager.findOne(Plan, fields.planId)

      if (user && plan) {
        // Check if provided amount is less than plan's min amount
        if (!new BigNumber(fields.amount).isLessThan(plan.minimumAmount)) {
          if (fields.useBonus) {
            const oldBonusBalance = new BigNumber(user.bonusBalance)

            if (oldBonusBalance.isGreaterThanOrEqualTo(fields.amount)) {
              // Calculate new user balance
              user.bonusBalance = oldBonusBalance.minus(fields.amount).toString()
    
              try {
                await txEntityManager.update(User, user.id, {
                  bonusBalance: user.bonusBalance
                })
                resolve(
                  await txEntityManager.save(
                    txEntityManager.create('Investment', {
                      userId: fields.userId,
                      planId: plan.id,
                      amount: fields.amount,
                      duration: plan.duration,
                      percentage: plan.percentage
                    })
                  )
                )
              } catch (error) {
                return reject(new AppError({
                  message: 'An unknown error occured!',
                  status: 500
                }))
              }
            } else {
              reject(new AppError({
                message: 'Bonus balance is insufficient!',
                status: 400
              }))
            }
          } else {
            const oldBalance = new BigNumber(user.balance)

            if (oldBalance.isGreaterThanOrEqualTo(fields.amount)) {
              // Calculate new user balance
              user.balance = oldBalance.minus(fields.amount).toString()
    
              try {
                await txEntityManager.update(User, user.id, {
                  balance: user.balance
                })
                resolve(
                  await txEntityManager.save(
                    txEntityManager.create('Investment', {
                      userId: fields.userId,
                      planId: plan.id,
                      amount: fields.amount,
                      duration: plan.duration,
                      percentage: plan.percentage
                    })
                  )
                )
              } catch (error) {
                return reject(new AppError({
                  message: 'An unknown error occured!',
                  status: 500
                }))
              }
            } else {
              reject(new AppError({
                message: 'Balance is too low!',
                status: 400
              }))
            }
          }
        } else {
          reject(new AppError({
            message: 'Amount is less than plan\'s minimum amount!',
            status: 400
          }))
        }
      } else {
        reject(new AppError({
          message: 'Unsuccessful operation!',
          status: 400
        }))
      }

    })
      .catch(error => {
        reject(new AppError({
          message: 'An error occured!',
          status: 500
        }))
      })
  })
}

export async function updateInvestments () {
  return getConnection().transaction('SERIALIZABLE', async txEntityManager => {
    const dueInvestments = await txEntityManager.find(Investment, {
      where: {
        status: InvestmentStatus.RUNNING
      }
    })

    for (const investment of dueInvestments) {
      const elapsedDuration = moment.duration(moment().diff(investment.createdAt)).asDays()

      if (new BigNumber(elapsedDuration).isGreaterThanOrEqualTo(investment.duration)) {
        investment.status = InvestmentStatus.COMPLETED
        investment.user.balance = new BigNumber(investment.amount)
            .times(investment.percentage)
            .div(100)
            .plus(investment.amount)
            .plus(investment.user.balance)
            .toString()

        await txEntityManager.save(investment)
      }
    }
  })
    .catch(err => {
      console.log(err)
    })
}