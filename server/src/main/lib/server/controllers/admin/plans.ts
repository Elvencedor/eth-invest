import {Request, Response} from 'express'
import v from 'validator'
import {respond} from '../../../respond'
import { Plan } from '../../../../db/entity/Plan'
import { getRepository, Like } from 'typeorm'
import { AppError } from '../../../errors/AppError'
import { Pagination } from '../../../pagination'

export async function index (req: Request, res: Response) {
  const limit = parseInt(req.query.limit || 10)
  const page = parseInt(req.query.page || 1)
  const searchQuery = req.query.search

  const planRepo = getRepository(Plan)

  const dynamicWhere = {
    id: Like('%' + searchQuery + '%')
  }

  if (!searchQuery) delete dynamicWhere.id

  try {
    const [plans, total] = await planRepo.findAndCount({
      where: [dynamicWhere],
      skip: limit * (page - 1),
      take: limit,
      order: { createdAt: 'DESC' }
    })

    const result = new Pagination<Plan>({
      results: plans,
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

export async function store (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.name || '')) {
    return respond(res, 400, [new AppError({ message: 'Name can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.duration || '')) {
    return respond(res, 400, [new AppError({ message: 'Duration can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.percentage || '')) {
    return respond(res, 400, [new AppError({ message: 'Percentage can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.minimumAmount || '')) {
    return respond(res, 400, [new AppError({ message: 'Min. amount can not be empty!', status: 400 })])
  }

  const planRepo = getRepository(Plan)
  
  try {
    const plan = await planRepo.save(planRepo.create({
      name: req.body.name,
      duration: req.body.duration,
      percentage: req.body.percentage,
      minimumAmount: req.body.minimumAmount,
      status: req.body.status,
    }))

    respond(res, 200, null, plan)
  } catch (error) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function show (req: Request, res: Response) {
  const planRepo = getRepository(Plan)

  try {
    const plan = await planRepo.findOne({
      where: [
        { id: req.params.id }
      ]
    })
  
    if (plan) {
      respond(res, 200, null, plan)
    } else {
      respond(res, 404, [new AppError({
        message: 'Plan not found',
        status: 404
      })])
    }  
  } catch (error) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function update (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.name || '')) {
    return respond(res, 400, [new AppError({ message: 'Name can not be empty!', status: 400 })])
  }

  if (v.isEmpty(String(req.body.duration) || '')) {
    return respond(res, 400, [new AppError({ message: 'Duration can not be empty!', status: 400 })])
  }

  if (v.isEmpty(String(req.body.percentage) || '')) {
    return respond(res, 400, [new AppError({ message: 'Percentage can not be empty!', status: 400 })])
  }
  
  if (v.isEmpty(req.body.minimumAmount || '')) {
    return respond(res, 400, [new AppError({ message: 'Min. amount can not be empty!', status: 400 })])
  }

  const planRepo = getRepository(Plan)

  try {
    const plan = await planRepo.findOne({
      where: [
        { id: req.params.id }
      ]
    })

    if (plan) {
      plan.name = req.body.name
      plan.duration = req.body.duration
      plan.percentage = req.body.percentage
      plan.minimumAmount = req.body.minimumAmount
      plan.status = req.body.status
  
      const savedPlan = await planRepo.save(plan)

      respond(res, 200, null, savedPlan)
    } else {
      respond(res, 404, [new AppError({
        message: 'Plan not found',
        status: 404
      })])
    }
  } catch (error) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}