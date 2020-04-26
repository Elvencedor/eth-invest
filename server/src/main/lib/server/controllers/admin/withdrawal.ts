import {Request, Response} from 'express'
import fetch from 'node-fetch'
import v from 'validator'
import {respond} from '../../../respond'
import { Withdrawal, WithdrawalStatus } from '../../../../db/entity/Withdrawal'
import { User } from '../../../../db/entity/User'
import { getRepository, Like } from 'typeorm'
import { AppError } from '../../../errors/AppError'
import BigNumber from 'bignumber.js'
import { Pagination } from '../../../pagination'

export async function index (req: Request, res: Response) {
  const limit = Number(req.query.limit || 10)
  const page = Number(req.query.page || 1)
  const searchQuery = req.query.search

  const withdrawalRepo = getRepository(Withdrawal)

  const dynamicWhere = {
    id: Like('%' + searchQuery + '%')
  }

  if (!searchQuery) delete dynamicWhere.id

  try {
    const [withdrawals, total] = await withdrawalRepo.findAndCount({
      where: [dynamicWhere],
      skip: limit * (page - 1),
      take: limit,
      order: { createdAt: 'DESC' }
    })

    const result = new Pagination<Withdrawal>({
      results: withdrawals,
      current: page,
      perPage: limit,
      total: total
    }, {
      limit: limit,
      page: page
    })
  
    respond(res, 200, null, result.results, {
      count: result.total,
      pagination: result.pagination
    })
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function update (req: Request, res: Response) {
  const withdrawalRepo = getRepository(Withdrawal)

  try {
    const withdrawal = await withdrawalRepo.findOne({
      where: [
        { id: req.params.id }
      ]
    })

    if (withdrawal) {
      if (withdrawal.status === WithdrawalStatus.COMPLETED) {
        return respond(res, 400, [new AppError({
          message: 'Wihdrawal was already completed!',
          status: 403
        })])
      }

      if (req.query.action === 'reject') {
        withdrawal.status = WithdrawalStatus.REJECTED //Update withdrawal status

        const savedWithdrawal = await withdrawalRepo.save(withdrawal)

        return respond(res, 200, null, savedWithdrawal)
      } else if (req.query.action === 'approve') {
        if (req.body.verify) {
          // Validation
          if (v.isEmpty(req.body.txid || '')) {
            return respond(res, 400, [new AppError({ message: 'Transaction hash can not be empty!', status: 400 })])
          }
          // verify txid
          const validTxHash = await isValidTxHash(req.body.txid)

          if (!validTxHash) {
            return respond(res, 400, [new AppError({
              message: 'Invalid transaction hash',
              status: 400
            })])
          }

          const approvedWithdrawal = await approveWithdrawal(withdrawal, req.body.txid)

          respond(res, 200, null, approvedWithdrawal)
        } else {
          const approvedWithdrawal = await approveWithdrawal(withdrawal, req.body.txid)

          respond(res, 200, null, approvedWithdrawal)
        }
      } else {
        respond(res, 400, [new AppError({
          message: 'Invalid query action',
          status: 400
        })])
      }
    } else {
      respond(res, 404, [new AppError({
        message: 'Withdrawal not found',
        status: 404
      })])
    }
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}
export async function approveWithdrawal (withdrawal: Withdrawal, txid:string):Promise<Withdrawal> {
  const withdrawalRepo = getRepository(Withdrawal)
  const userRepo = getRepository(User)

  try {
    const user = await userRepo.findOne(withdrawal.userId)
  
    const newBalance = new BigNumber(user!.balance).minus(withdrawal.amount).toString()

    user!.balance = newBalance //Update user balance
    withdrawal.txid = txid
    withdrawal.status = WithdrawalStatus.COMPLETED //Update withdrawal status

    await userRepo.save(user!)
    const savedWithdrawal = await withdrawalRepo.save(withdrawal)

    return savedWithdrawal
  } catch (err) {
    throw err
  }
}

export async function isValidTxHash (txid:string):Promise<boolean | Error> {
  try {
    const res = await fetch(`https://blockchain.info/rawtx/${txid}`)
    const data = await res.json()

    if (data.hash !== txid) {
      return false
    }

    return true
  } catch (err) {
    throw err
  }
}