import * as speakeasy from 'speakeasy'
import v from 'validator'
import {Request, Response} from 'express'
import * as authService from '../../services/auth'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'

export async function createSession (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.login || '')) {
    return respond(res, 400, [new AppError({ message: 'Login field can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.password || '')) {
    return respond(res, 400, [new AppError({ message: 'Password can not be empty!', status: 400 })])
  }

  authService.authenticate({
    login: req.body.login,
    password: req.body.password
  })
    .then(user => {
      if (!user.tfaEnabled) {
        req.session!.user = user
        return respond(res, 200, null, user.id)
      }

      if (!req.header('x-otp')) {
        return respond(res, 206, [new AppError({ message: 'Please enter otp to continue!', status: 206 })])
      }

      const verified = speakeasy.totp.verify({
        secret: user.tfaSecret,
        encoding: 'base32',
        token: req.header('x-otp') || ''
      })

      if (!verified) {
        return respond(res, 400, [new AppError({ message: 'Invalid OTP!', status: 400 })])
      }

      req.session!.user = user
      return respond(res, 200, null, user.id)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function deleteSession (req: Request, res: Response) {
  // destroy session
  if (req.session!.user) {
    req.session!.destroy((err => {
      if (err) {
        return respond(res, 500, [new AppError({ message: 'Server error!', status: 500 })])
      }

      respond(res, 200, null, null)
    }))
  } else respond(res, 403, [new AppError({ message: 'No session to destroy!', status: 403 })])
}