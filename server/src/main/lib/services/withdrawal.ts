import BigNumber from 'bignumber.js'
import { getRepository, Like, getConnection } from 'typeorm'
import { Withdrawal, WithdrawalStatus } from '../../db/entity/Withdrawal';
import { AppError } from '../errors/AppError'
import { WithdrawalRequestPayload } from '../../../ts/types'
import { User } from '../../db/entity/User'
import { Pagination, PaginationOptionsInterface } from '../pagination'

export async function fetchWithdrawals (query:any, options: PaginationOptionsInterface):Promise<Pagination<Withdrawal>> {
  const searchQuery = query.search || ''
  const withdrawalRepo = getRepository(Withdrawal)

  const [withdrawals, total] = await withdrawalRepo.createQueryBuilder('withdrawal')
    .leftJoinAndSelect(
      'withdrawal.beneficiary',
      'beneficiary'
    )
    .select([
      'beneficiary.id',
      'beneficiary.username',
      'withdrawal.id',
      'withdrawal.amount',
      'withdrawal.status',
      'withdrawal.txid',
      'withdrawal.target',
      'withdrawal.createdAt',
      'withdrawal.updatedAt'
    ])
    .where('withdrawal.userId = :id', { id: query.userId })
    .andWhere('withdrawal.id like :idStr', { idStr: '%' + searchQuery + '%' })
    .skip(options.limit * (options.page - 1))
    .take(options.limit)
    .orderBy('withdrawal.createdAt', 'DESC')
    .getManyAndCount()
  
  return new Promise((resolve, reject) => {
    if (withdrawals) {
      resolve(new Pagination<Withdrawal>({
        results: withdrawals,
        current: options.page,
        perPage: options.limit,
        total: total,
      }, options))
    } else reject(new AppError({
      message: 'Withdrawal not found!',
      status: 403
    }))
  })
}

export async function fetchPendingWithdrawals (query:any):Promise<Withdrawal[]> {
  const withdrawalRepo = getRepository(Withdrawal)
  const withdrawals = await withdrawalRepo.find({
    where: [
      { userId: query.userId, status: WithdrawalStatus.PENDING },
    ]
  })
  
  return new Promise((resolve, reject) => {
    if (withdrawals) {
      resolve(withdrawals)
    } else reject(new AppError({
      message: 'Withdrawal not found!',
      status: 403
    }))
  })
}

export async function requestWithdrawal (fields: WithdrawalRequestPayload):Promise<any> {
  return new Promise(async (resolve, reject) => {
    getConnection().transaction('SERIALIZABLE', async txEntityManager => {
      const user = await txEntityManager.findOne(
        User,
        fields.userId
      )

      if (new BigNumber(user!.balance).isLessThan(fields.amount)) {
        return reject(new AppError({
          message: 'Requested amount exceeds balance!',
          status: 400
        }))
      }

      user!.balance = new BigNumber(user!.balance).minus(fields.amount).toString()
      await txEntityManager.save(user)

      resolve(await txEntityManager.insert(Withdrawal, {
        userId: user!.id,
        amount: fields.amount,
        target: user!.btcAddress
      }))
    })
  })
}

export async function cancelWithdrawal (fields:any):Promise<any> {
  return new Promise(async (resolve, reject) => {
    getConnection().transaction('SERIALIZABLE', async txEntityManager => {
      const withdrawal = await txEntityManager.findOne(
        Withdrawal,
        fields.withdrawalId,
        {
          relations: ['user'],
          where: { userId: fields.userId }
        }
      )

      if (!withdrawal) {
        return reject(new AppError({
          message: 'Invalid operation!',
          status: 400
        }))
      }

      if(withdrawal.status !== WithdrawalStatus.PENDING) {
        return reject(new AppError({
          message: 'Withdrawal is not pending!',
          status: 400
        }))
      }

      withdrawal.user.balance = new BigNumber(withdrawal.user.balance).plus(withdrawal.amount).toString()
      withdrawal.status = WithdrawalStatus.CANCELLED

      resolve(await txEntityManager.save(withdrawal))
    })
  })
}
