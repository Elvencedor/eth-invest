import config from 'config'
import {Request, Response} from 'express'
import moment from 'moment'
import v from 'validator'
import * as investmentService from '../../services/investment'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'
import { BigNumber } from 'bignumber.js'

export async function fetchSubscriptions (req: Request, res: Response) {
  investmentService.fetchInvestments({
    userId: req.session!.user.id,
    search: req.query.search
  },
  {
    limit: Number(req.query.limit || 10),
    page: Number(req.query.page || 1)
  })
    .then(result => {
      const newInvestments: Object[] = []

      result.results.forEach(investment => {
        const daysElapsed = moment(Date.now()).diff(investment.createdAt, 'days')

        newInvestments.push({ ...investment, daysElapsed })
      })
      
      respond(res, 200, null, newInvestments, { 
        count: result.total,
        pagination: result.pagination
      })
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function createInvestment (req: Request, res: Response) {
  if (!config.get('misc.enableFeature.investment')) {
    return respond(res, 400, [new AppError({ message: 'Investment has been disabled by administrator!', status: 400 })])
  }

  if (v.isEmpty(req.params.planId || '')) {
    return respond(res, 400, [new AppError({ message: 'Choose a plan!', status: 400 })])
  }

  if (v.isEmpty(req.body.amount || '')) {
    return respond(res, 400, [new AppError({ message: 'Amount can not be empty!', status: 400 })])
  }

  if (new BigNumber(req.body.amount).isNaN()) {
    return respond(res, 400, [new AppError({ message: 'Amount is invalid!', status: 400 })])
  }

  investmentService.createInvestment({
    userId: req.session!.user.id,
    planId: req.params.planId,
    amount: req.body.amount,
    useBonus: req.body.useBonus
  })
    .then(investment => {
      respond(res, 200, null, investment.id)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}