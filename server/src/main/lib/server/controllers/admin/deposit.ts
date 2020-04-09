import {Request, Response} from 'express'
import {respond} from '../../../respond'
import { Deposit, DepositStatus } from '../../../../db/entity/Deposit'
import { getRepository, Like } from 'typeorm'
import { AppError } from '../../../errors/AppError'
import { Pagination } from '../../../pagination'
import v from 'validator'
import * as depositService from '../../../services/deposit'

export async function index (req: Request, res: Response) {
  const limit = parseInt(req.query.limit || 10)
  const page = parseInt(req.query.page || 1)
  const searchQuery = req.query.search

  const depositRepo = getRepository(Deposit)

  const dynamicWhere = {
    id: Like('%' + searchQuery + '%')
  }

  if (!searchQuery) delete dynamicWhere.id

  try {
    const [deposits, total] = await depositRepo.findAndCount({
      where: [dynamicWhere],
      skip: limit * (page - 1),
      take: limit,
      order: { createdAt: 'DESC' }
    })

    const result = new Pagination<Deposit>({
      results: deposits,
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
  const depositRepo = getRepository(Deposit)

  try {
    const deposit = await depositRepo.findOne({
      where: [
        { id: req.params.id }
      ]
    })

    if (deposit) {
      if (deposit.status === DepositStatus.COMPLETED) {
        return respond(res, 400, [new AppError({
          message: 'Deposit was already verified!',
          status: 400
        })])
      }

      deposit.status = DepositStatus.CANCELLED
  
      const savedDeposit = await depositRepo.save(deposit)

      respond(res, 200, null, savedDeposit)
    } else {
      respond(res, 400, [new AppError({
        message: 'Deposit not found',
        status: 400
      })])
    }
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function rependDeposit (req: Request, res: Response) {
  const depositRepo = getRepository(Deposit)

  try {
    const deposit = await depositRepo.findOne({
      where: [
        { id: req.params.id }
      ]
    })

    if (deposit) {
      if (deposit.status === DepositStatus.COMPLETED) {
        return respond(res, 400, [new AppError({
          message: 'Deposit was already verified!',
          status: 400
        })])
      }

      deposit.status = DepositStatus.PENDING
  
      const savedDeposit = await depositRepo.save(deposit)

      respond(res, 200, null, savedDeposit)
    } else {
      respond(res, 400, [new AppError({
        message: 'Deposit not found',
        status: 400
      })])
    }
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function updateTxId (req: Request, res: Response) {
  if (v.isEmpty(req.body.txid || '')) {
    return respond(res, 400, [new AppError({ message: 'Transaction hash can not be empty!', status: 400 })])
  }

  try {
    const deposit = await depositService.updateDeposit(req.params.id, {
      txid: req.body.txid
    })
     
    respond(res, 200, null, deposit)
  } catch (err) {
    respond(res, err.getStatus(), [err])
  }
}