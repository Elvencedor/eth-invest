import {Request, Response} from 'express'
import v from 'validator'
import * as tfaService from '../../services/tfa'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'

export async function setupTfa (req: Request, res: Response) {
  tfaService.setup({
    userId: req.session!.user.id,
  })
    .then(data => {
      respond(res, 200, null, data)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function verifyTfa (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.token || '')) {
    return respond(res, 400, [new AppError({ message: 'Token can not be empty!', status: 400 })])
  }

  tfaService.verify({
    userId: req.session!.user.id,
    token: req.body.token
  })
    .then(user => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function destroyTfa (req: Request, res: Response) {
  tfaService.destroy({
    userId: req.session!.user.id
  })
    .then(user => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}