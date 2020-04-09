import {Request, Response} from 'express'
import v from 'validator'
import config from 'config'
import nodemailer from 'nodemailer'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'

export async function action (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Email can not be empty!', status: 400 })])
  }

  if (!v.isEmail(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Invalid email address!', status: 400 })])
  }

  if (v.isEmpty(req.body.name || '')) {
    return respond(res, 400, [new AppError({ message: 'Name can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.topic || '')) {
    return respond(res, 400, [new AppError({ message: 'Topic can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.description || '')) {
    return respond(res, 400, [new AppError({ message: 'Description can not be empty!', status: 400 })])
  }

  var transport = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: config.get('mail.port'),
    auth: {
      user: config.get('mail.username'),
      pass: config.get('mail.password')
    }
  })

  try {
    await transport.sendMail({
      from: req.body.email,
      to: config.get('mail.support'),
      subject: `Support - ${req.body.topic === 'other' ? req.body.customTopic : req.body.topic}`,
      text: req.body.description,
      html: req.body.description
    })

    respond(res, 200, null)
  } catch (err) {
    respond(res, 500, [new AppError({ message: 'An unknown error occured', status: 500 })])
  }
}
