import config from 'config'
import {Request, Response} from 'express'
import v from 'validator'
import * as userService from '../../services/user'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'
import BigNumber from 'bignumber.js'

export async function fetchSelf (req: Request, res: Response) {
  userService.fetchUserProfile({
    id: req.session!.user.id
  })
    .then(userProfile => {
      respond(res, 200, null, userProfile)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function resendConfirmationMail (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Email can not be empty!', status: 400 })])
  }

  if (!v.isEmail(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Invalid email address!', status: 400 })])
  }

  userService.resendConfirmationMail( { email: req.body.email } )
    .then(() => {
      respond(res, 200, null)
    })
    .catch(err => {
      console.log(err)
      respond(res, err.getStatus(), [err])
    })
}

export async function transferFund (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.beneficiary || '')) {
    return respond(res, 400, [new AppError({ message: 'Beneficiary can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.amount || '')) {
    return respond(res, 400, [new AppError({ message: 'Amount can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.password || '')) {
    return respond(res, 400, [new AppError({ message: 'Password can not be empty!', status: 400 })])
  }

  userService.transferFund({
    benefactorId: req.session!.user.id,
    benefactorPassword: req.body.password,
    beneficiaryUsername: req.body.beneficiary,
    amount: new BigNumber(req.body.amount).toFixed(2)
  })
    .then((user) => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      console.log(err)
      respond(res, err.getStatus(), [err])
    })
}

export async function fetchUser (req: Request, res: Response) {
  userService.fetchUser({
    username: req.params.username
  })
    .then(user => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function updateUser (req: Request, res: Response) {
  // validation
  if (v.isEmpty(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Email can not be empty!', status: 400 })])
  }

  if (!v.isEmail(req.body.email || '')) {
    return respond(res, 400, [new AppError({ message: 'Invalid email address!', status: 400 })])
  }

  if (v.isEmpty(req.body.fullName || '')) {
    return respond(res, 400, [new AppError({ message: 'Full name can not be empty!', status: 400 })])
  }

  userService.updateUser({
    id: req.session!.user.id,
    email: req.body.email,
    fullName: req.body.fullName,
    btcAddress: req.body.btcAddress
  })
    .then(user => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function updatePassword (req: Request, res: Response) {
  // Validation
  if (v.isEmpty(req.body.currentPassword || '')) {
    return respond(res, 400, [new AppError({ message: 'Current password can not be empty!', status: 400 })])
  }

  if (v.isEmpty(req.body.newPassword || '')) {
    return respond(res, 400, [new AppError({ message: 'New password can not be empty!', status: 400 })])
  }
  
  userService.updatePassword({
    id: req.session!.user.id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  })
    .then(user => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function updateEmail (req: Request, res: Response) {
  if (v.isEmpty(req.body.userId || '') || v.isEmpty(req.body.tokenId || '')) {
    return respond(res, 400, [new AppError({ message: 'Validation error!', status: 400 })])
  }
  
  userService.updateEmail({
    userId: req.session!.user.id || req.body.userId,
    tokenId: req.body.tokenId
  })
    .then(user => {
      respond(res, 200, null, user)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function registerUser (req: Request, res: Response) {
  if (!config.get('misc.enableFeature.registration')) {
    return respond(res, 400, [new AppError({ message: 'Registration has been disabled by administrator!', status: 400 })])
  }

  if (!v.isEmail(req.body.email)) {
    return respond(res, 400, [new AppError({ message: 'Invalid email address!', status: 400 })])
  }

  if (v.isEmpty(req.body.password || '')) {
    return respond(res, 400, [new AppError({ message: 'Password can not be empty!', status: 400 })])
  }

  if (!v.isLength(req.body.fullName || '', {
    min: 3,
    max: 32
  })) {
    return respond(res, 400, [new AppError({ message: 'Full name must not be less than 3 or greater than 32!', status: 400 })])
  }

  if (!v.isLength(req.body.username || '', {
    min: 3,
    max: 32
  })) {
    return respond(res, 400, [new AppError({ message: 'Username must not be less than 3 or greater than 32!', status: 400 })])
  }

  if (!v.matches(req.body.username || '', /^(?=[_\da-zA-Z]*$)(?!_*$)(?=(.*[a-zA-Z]){2})/)) {
    return respond(res, 400, [new AppError({ message: 'Username can only contain alphanumeric and underscore', status: 400 })])
  }

  userService.createUser({
    email: String(req.body.email).toLowerCase(),
    password: req.body.password,
    fullName: String(req.body.fullName)
      .toLowerCase()
      .replace(/[^-'\s]+/g , function(word) {
        return word.replace(/^./, function(first) {
          return first.toUpperCase()
        })
      }),
    username: String(req.body.username).toLowerCase(),
    referrer: req.body.referrer
  })
    .then(user => {
      respond(res, 200, null, user.id)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function deleteUser (req: Request, res: Response) {
  userService.deleteUser({ id: req.params.userId })
    .then(user => {
      respond(res, 200, null, user.id)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}