import {Request, Response} from 'express'
import v from 'validator'
import * as withdrawalService from '../../services/withdrawal'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'
import BigNumber from 'bignumber.js'
import { get } from '../../store';
import config from 'config';

export async function fetchWithdrawals (req: Request, res: Response) {
  withdrawalService.fetchWithdrawals({
    userId: req.session!.user.id,
    search: req.query.search
  },
  {
    limit: Number(req.query.limit || 10),
    page: Number(req.query.page || 1)
  })
    .then(async result => {
      respond(res, 200, null, result.results, { 
        count: result.total,
        pagination: result.pagination
      })
    })
    .catch(err => {
      console.log(err)
      respond(res, err.getStatus(), [err])
    })
}

export async function requestWithdrawal (req: Request, res: Response) {
  if (!config.get('misc.enableFeature.withdrawal')) {
    return respond(res, 400, [new AppError({ message: 'Withdrawal has been disabled by administrator!', status: 400 })])
  }

  if (v.isEmpty(req.body.amount || '')) {
    return respond(res, 400, [new AppError({ message: 'Amount can not be empty!', status: 400 })])
  }

  if (new BigNumber(req.body.amount).isNaN()) {
    return respond(res, 400, [new AppError({ message: 'Amount is invalid!', status: 400 })])
  }

  if (new BigNumber(req.body.amount || 0).isLessThan(config.get('misc.limit.withdrawal.min'))) {
    return respond(res, 400, [new AppError({ message: `Minimum withdrawal amount: $${new BigNumber(config.get('misc.limit.withdrawal.min')).toFormat(2)}!`, status: 400 })])
  }

  const userId = req.session!.user.id

  try {
    if (req.session!.user.btcAddress) {
      withdrawalService.requestWithdrawal({
        userId,
        amount: req.body.amount,
        description: req.body.description || null
      })
        .then(withdrawal => {
          respond(res, 200, null, withdrawal)
        })
        .catch(err => {
          respond(res, err.getStatus(), [err])
        })
    } else {
      const error = new AppError({
        message: 'Please set your Bitcoin wallet address first!',
        status: 400
      })
      respond(res, error.getStatus(), [error])
    }
  } catch (err) {
    console.log(err)
    respond(res, err.getStatus(), [err])
  }
}

export async function cancelWithdrawal (req: Request, res: Response) {
  withdrawalService.cancelWithdrawal({
    withdrawalId: req.params.id,
    userId: req.session!.user.id
  })
    .then(result => {
      respond(res, 200, null, result)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}