import {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import v from 'validator'
import {respond} from '../../../respond'
import { User, UserStatus } from '../../../../db/entity/User'
import { getRepository, getConnection, Like } from 'typeorm'
import { AppError } from '../../../errors/AppError'
import { Pagination } from '../../../pagination'

export async function index (req: Request, res: Response) {
  const limit = Number(req.query.limit || 10)
  const page = Number(req.query.page || 1)
  const searchQuery = req.query.search

  const userRepo = getRepository(User)

  const dynamicWhere = {
    id: Like('%' + searchQuery + '%')
  }

  if (!searchQuery) delete dynamicWhere.id

  try {
    const [users, total] = await userRepo.findAndCount({
      where: [dynamicWhere],
      skip: limit * (page - 1),
      take: limit,
      select: [
        'id',
        'email',
        'fullName',
        'username',
        'balance',
        'bonusBalance',
        'btcAddress',
        'role',
        'status',
        'createdAt',
        'updatedAt'
      ],
      order: { createdAt: 'DESC' }
    })

    const result = new Pagination<User>({
      results: users,
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
  if (v.isEmpty(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Email can not be empty!', status: 400 })])
  }

  if (!v.isEmail(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Invalid email address!', status: 400 })])
  }

  if (v.isEmpty(req.body.password || '')) {
    return respond(res, 400, [new AppError({ message: 'Password can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.fullName || '')) {
    return respond(res, 400, [new AppError({ message: 'Full name can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.username || '')) {
    return respond(res, 400, [new AppError({ message: 'Username can not be empty!', status: 400 })])
  }

  if (!v.isLength(req.body.username || '', {
    min: 3,
    max: 32
  })) {
    return respond(res, 400, [new AppError({ message: 'Username must not be less than 3 and greater than 32!', status: 400 })])
  }

  if (!v.matches(req.body.username || '', /^(?=[_\da-zA-Z]*$)(?!_*$)(?=(.*[a-zA-Z]){2})/)) {
    return respond(res, 400, [new AppError({ message: 'Username can only contain alphanumeric and underscore', status: 400 })])
  }

  const userRepo = getRepository(User)

  try {
    const user = await userRepo.findOne({
      where: [
        { email: req.body.email },
        { username: req.body.username }
      ]
    })

    if (user) {
      const matchedField = user.email === req.body.email
        ? 'E-mail'
        : 'Username'
  
      return respond(res, 400, [new AppError({
        message: `${matchedField} is already registered!`,
        status: 400
      })])
    }
     
    const passhash = await bcrypt.hash(req.body.password, 8)
  
    const savedUser = await userRepo.save(userRepo.create({
      fullName: req.body.fullName,
      email: req.body.email,
      username: req.body.username,
      passhash,
      btcAddress: req.body.btcAddress,
      balance: req.body.balance,
      bonusBalance: req.body.bonusBalance,
      status: req.body.status,
      role: req.body.role
    }))

    respond(res, 200, null, savedUser)
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function show (req: Request, res: Response) {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: req.params.id }
    ]
  })

  if (user) {
    respond(res, 200, null, user)
  } else {
    respond(res, 404, [new AppError({
      message: 'User not found',
      status: 404
    })])
  }
}

export async function update (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Email can not be empty!', status: 400 })])
  }

  if (!v.isEmail(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Invalid email address!', status: 400 })])
  }

  if (v.isEmpty(req.body.fullName || '')) {
    return respond(res, 400, [new AppError({ message: 'Full name can not be empty!', status: 400 })])
  }

  try {
    await getConnection().transaction('SERIALIZABLE', async txEntityManager => {
      const user = await txEntityManager.findOne(User, req.params.id)

      if (user) {
        user.fullName = req.body.fullName
        user.email = req.body.email
        user.btcAddress = req.body.btcAddress
        user.balance = req.body.balance
        user.bonusBalance = req.body.bonusBalance
        user.role = req.body.role
        user.status = req.body.status
        user.tfaEnabled = req.body.tfaEnabled === false ? req.body.tfaEnabled : user.tfaEnabled
    
        const savedUser = await txEntityManager.save(user)
  
        respond(res, 200, null, savedUser)
      } else {
        respond(res, 404, [new AppError({
          message: 'User not found',
          status: 400
        })])
      }
    })
  } catch (err) {
    respond(res, 500, [new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })])
  }
}

export async function destroy (req: Request, res: Response) {
  const userRepo = getRepository(User)

  try {
    const user = await userRepo.findOne({
      where: [
        { id: req.params.id }
      ]
    })

    if (user) {
      user.status = UserStatus.DELETED
  
      const savedUser = await userRepo.save(user)

      respond(res, 200, null, savedUser)
    } else {
      respond(res, 404, [new AppError({
        message: 'User not found',
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