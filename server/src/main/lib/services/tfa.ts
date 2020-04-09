import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'
import { getRepository } from 'typeorm'
import { User } from '../../db/entity/User'
import { AppError } from '../errors/AppError'

export async function setup (fields: any):Promise<any> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: fields.userId }
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      if (user.tfaEnabled) return reject(new AppError({
        message: '2FA is already enabled!',
        status: 400
      }))

      const secret = speakeasy.generateSecret({
        length: 10,
        name: user.email,
        issuer: 'CrespoTradersClub'
      })

      const url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: `${user.email}`,
        issuer: 'CrespoTradersClub',
        encoding: 'base32'
      })

      QRCode.toDataURL(url).then(dataURL => {
        user.tfaSecret = secret.base32

        userRepo.save(user).then(() => resolve({
          dataURL,
          tempSecret: secret.base32,
          tfaURL: secret.otpauth_url
        }))
      }).catch(err => reject(new AppError({
        message: 'An error occured!',
        status: 500
      })))
    } else reject(new AppError({
      message: 'Invalid credentials!',
      status: 403
    }))
  })
}

export async function verify (fields: any):Promise<any> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: fields.userId }
    ],
    select: [
      'id',
      'tfaSecret',
      'tfaEnabled',
      'email',
      'balance',
      'btcAddress',
      'fullName',
      'bonusBalance'
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      const verified = speakeasy.totp.verify({
        secret: user.tfaSecret,
        encoding: 'base32',
        token: fields.token
      })

      if (verified) {
        user.tfaEnabled = true
        userRepo.save(user)
          .then(() => resolve({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            balance: user.balance,
            btcAddress: user.btcAddress,
            tfaEnabled: user.tfaEnabled,
            tfaSecret: user.tfaSecret
          }))
          .catch(err => reject(new AppError({
            message: 'An error occured!',
            status: 500
          })))
      } else reject(new AppError({
        message: 'Invalid auth code! Ensure your device time is synced!',
        status: 400
      }))
    } else reject(new AppError({
      message: 'Invalid credentials!',
      status: 403
    }))
  })
}

export async function destroy (fields: any):Promise<any> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: fields.userId }
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      user.tfaEnabled = false

      userRepo.save(user)
        .then(() => resolve({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          balance: user.balance,
          btcAddress: user.btcAddress,
          tfaEnabled: user.tfaEnabled
        }))
        .catch(err => reject(new AppError({
          message: 'An error occured!',
          status: 500
        })))
    } else reject(new AppError({
      message: 'Invalid credentials!',
      status: 403
    }))
  })
}