import {Request, Response} from 'express'
import { getRepository, Like } from 'typeorm'
import {respond} from '../../../respond'
import { Investment } from '../../../../db/entity/Investment'
import { AppError } from '../../../errors/AppError'
import { Pagination } from '../../../pagination'
import moment = require('moment')

export async function index (req: Request, res: Response) {
  const limit = Number(req.query.limit || 10)
  const page = Number(req.query.page || 1)
  const searchQuery = req.query.search

  const investmentRepo = getRepository(Investment)

  const dynamicWhere = {
    id: Like('%' + searchQuery + '%')
  }

  if (!searchQuery) delete dynamicWhere.id

  try {
    const [investments, total] = await investmentRepo.findAndCount({
      where: [dynamicWhere],
      skip: limit * (page - 1),
      take: limit,
      order: { createdAt: 'DESC' }
    })

    const result = new Pagination<Investment>({
      results: investments,
      current: page,
      perPage: limit,
      total: total
    }, {
      limit: limit,
      page: page
    })

    const newInvestments: Object[] = []
    
    result.results.forEach(investment => {
      const daysElapsed = moment(Date.now()).diff(investment.createdAt, 'days')

      newInvestments.push({ ...investment, daysElapsed })
    })
  
    respond(res, 200, null, newInvestments, {
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
