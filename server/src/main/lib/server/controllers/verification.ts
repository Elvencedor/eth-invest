import {Request, Response} from 'express'
import v from 'validator'
import {respond} from '../../respond'
import { getRepository } from 'typeorm'
import { User, UserStatus } from '../../../db/entity/User'
import { Token } from '../../../db/entity/Token'
import { AppError } from '../../errors/AppError'

export async function activateUser (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.userId || '') || v.isEmpty(req.body.tokenId || '')) {
    return respond(res, 400, [new AppError({ message: 'Validation error!', status: 400 })])
  }

  const tokenRepo = getRepository(Token)
  const userRepo = getRepository(User)

  return userRepo.findOne(req.body.userId)
    .then(user => {
      if (user && user.status !== UserStatus.ACTIVE) {
        tokenRepo.findOne(req.body.tokenId)
          .then(token => {
            if (token) {
              if (token.userId === user.id) {
                user.status = UserStatus.ACTIVE
                return userRepo.save(user)
                  .then(user => respond(res, 200, null, 'Account has been verified!'))
                  .catch(err => respond(res, err.getStatus(), [err]))
              } else {
                return respond(res, 400, [new AppError({
                  message: 'Invalid operation!',
                  status: 400
                })])
              }
            } else {
              return respond(res, 400, [new AppError({
                message: 'Token expired!',
                status: 400
              })])
            }
          }).catch(err => respond(res, err.getStatus(), [err]))
      } else {
        respond(res, 400, [new AppError({
          message: 'Verification failed',
          status: 400
        })])
      }
    }).catch(err => respond(res, err.getStatus(), [err]))
}
