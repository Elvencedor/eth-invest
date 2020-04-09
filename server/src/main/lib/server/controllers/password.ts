import {Request, Response} from 'express'
import config from 'config'
import crypto from 'crypto-random-string'
import bcrypt from 'bcrypt'
import v from 'validator'
import * as mailService from './../../services/mail'
import {respond} from '../../respond'
import { getRepository } from 'typeorm'
import { User } from '../../../db/entity/User'
import * as userService from '../../services/user'
import { Token } from '../../../db/entity/Token'
import { AppError } from '../../errors/AppError'
import BigNumber from 'bignumber.js'

export async function forgotPassword (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'E-mail can not be empty!', status: 400 })])
  }

  if (!v.isEmail(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Invalid e-mail address!', status: 400 })])
  }

  const tokenRepo = getRepository(Token)

  return userService.fetchUser({ email: req.body.email })
    .then(user => {
      tokenRepo.save(tokenRepo.create({
        userId: user.id,
        token: crypto({ length: 16 }),
      })).then(token => {
        const domain = config.get('server.clientHost')
        const verificationLink = `${domain}/password_reset?tokenId=${token.id}&userId=${user.id}`
        const text = `
          Hello ${user.fullName},
          You are receiving this because you (or someone else) have requested the reset of the password for your account.
          Please click on the following link to complete the process:
          <a href="${verificationLink}">Click here to reset your password</a>
          If you did not request this, please ignore this e-mail and your password will remain unchanged.
        `

        mailService.send({
          to: user.email,
          subject: 'CrespoTradersClub Password Reset',
          text: text
        })

        respond(res, 200, null, 'If such account exists, an e-mail has been sent!')
      }).catch(err => respond(res, err.getStatus(), [err]))
      
    })
    .catch(err => {
      if (new BigNumber(err.getStatus()).isEqualTo(401)) {
        respond(res, 200, null, 'If such account exists, an e-mail has been sent!')
      } else {
        respond(res, 500, [new AppError({
          message: 'An unknown error occured!',
          status: 500
        })])
      }
    })
}

export async function resetPassword (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.userId || '') || v.isEmpty(req.body.tokenId || '')) {
    return respond(res, 400, [new AppError({ message: 'Validation error!', status: 400 })])
  }

  const tokenRepo = getRepository(Token)
  const userRepo = getRepository(User)

  return userRepo.findOne(req.body.userId)
    .then(user => {
      if (user) {
        tokenRepo.findOne(req.body.tokenId)
          .then(token => {
            if (token) {
              if (token.userId !== user.id) return respond(res, 500, [new AppError({
                message: 'Invalid operation!',
                status: 400
              })])

              bcrypt.hash(req.body.password, 8, (err:Error, passhash:any) => {
                if (err) respond(res, 500, [new AppError({
                  message: 'Token expired',
                  status: 400
                })])

                user.passhash = passhash
                return userRepo.save(user)
                  .then((user) => {
                    const text = `
                      Hello ${user.fullName},
                      This is a confirmation that the password for your account has just been changed.
                    `
                    mailService.send({
                      to: user.email,
                      subject: 'Your password has been changed',
                      text: text
                    })

                    respond(res, 200, null, 'Your password has been changed!')
                  })
                  .catch(err => respond(res, err.getStatus(), [err]))
              })
            } else {
              return respond(res, 400, [new AppError({
                message: 'Token expired!',
                status: 400
              })])
            }
          }).catch(err => respond(res, err.getStatus(), [err]))
      } else {
        respond(res, 400, [new AppError({
          message: 'Password reset failed!',
          status: 400
        })])
      }
    }).catch(err => respond(res, err.getStatus(), [err]))
}
