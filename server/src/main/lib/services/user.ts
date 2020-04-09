import config from 'config'
import bcrypt from 'bcrypt'
import crypto from 'crypto-random-string'
import { getRepository, getConnection } from 'typeorm'
import { User, UserStatus } from '../../db/entity/User'
import { Referral } from '../../db/entity/Referral'
import * as mailService from './mail'
import { Token } from '../../db/entity/Token'
import { AppError } from '../errors/AppError'
import {
  RegisterPayload,
  ProfileUpdatePayload,
  PasswordUpdatePayload
} from '../../../ts/types'
import BigNumber from 'bignumber.js'
import { Deposit, DepositStatus } from '../../db/entity/Deposit';
import { Withdrawal, WithdrawalStatus } from '../../db/entity/Withdrawal';
import moment from 'moment'

export async function createUser (fields: RegisterPayload):Promise<User> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { email: fields.email },
      { username: fields.username }
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      const matchedField = user.email === fields.email
        ? 'E-mail'
        : 'Username'
      reject(new AppError({
        message: `${matchedField} is already registered!`,
        status: 403
      }))
    } else {
      // Check referrer
      userRepo.findOne({
        where: { username: fields.referrer || '' }
      })
        .then(referrer => {
          bcrypt.hash(fields.password, 8, (err:any, passhash:any) => {
            if (err) reject(new AppError({
              message: 'An unexpected error occured!',
              status: 500
            }))

            userRepo.save(userRepo.create({
              fullName: fields.fullName,
              email: fields.email,
              username: fields.username,
              // referrer,
              passhash
            }))
              .then(user => {
                const referralRepo = getRepository(Referral)

                if (referrer) { // Create referral
                  referralRepo.save(referralRepo.create({
                    userId: user.id,
                    referrerId: referrer.id
                  }))
                }

                const tokenRepo = getRepository(Token)
    
                tokenRepo.save(tokenRepo.create({
                  userId: user.id,
                  token: crypto({ length: 16 }),
                })).then(token => {
                  const clientHost = config.get('server.clientHost')
                  const verificationLink = `${clientHost}/verification?tokenId=${token.id}&userId=${user.id}`
                  const text = `
                  Welcome, ${user.fullName}. 
                  Click on the following link to activate your account: 
                  <a href="${verificationLink}">${verificationLink}</a>
                  `
    
                  mailService.send({
                    to: user.email,
                    subject: 'CrespoTradersClub Account Activation',
                    text: text
                  })
                  
                  resolve(user)
                }).catch(err => {
                  console.log(err)
                  reject(new AppError({
                    message: 'An unexpected error occured!',
                    status: 500
                  }))
                })
              })
              .catch(err => {
                console.log(err)
                reject(new AppError({
                  message: 'An unexpected error occured!',
                  status: 500
                }))
              })
          })
        })
        .catch(err => {
          console.log(err)
          reject(new AppError({
            message: 'An unexpected error occured!',
            status: 500
          }))
        })
    }
  })
}

export async function resendConfirmationMail (query: { email:string }):Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await fetchUser({ email: query.email })
  
      if (user && user.status === UserStatus.INACTIVE) {
        const userRepo = getRepository(User)
        const tokenRepo = getRepository(Token)
        const mome = moment.duration(moment().diff(user.updatedAt))
        const elapsedDuration = new BigNumber(
          mome.asMilliseconds()
        )
  
        if (
          elapsedDuration.isLessThan(config.get('misc.resendConfirmationMailDuration'))
        ) {
          return reject(new AppError({
            message: `Please try again in ${new BigNumber(config.get('misc.resendConfirmationMailDuration')).div(1000).div(60).minus(mome.asMinutes()).toFixed(0)} minutes!`,
            status: 400
          }))
        }
      
        const savedToken = await tokenRepo.save(tokenRepo.create({
          userId: user.id,
          token: crypto({ length: 16 }),
        }))
  
        const domain = config.get('server.clientHost')
        const verificationLink = `${domain}/verification?tokenId=${savedToken.id}&userId=${user.id}`
        const text = `
          Welcome, ${user.fullName}. 
          Click on the following link to activate your account: 
          <a href="${verificationLink}">${verificationLink}</a>
        `
  
        mailService.send({
          to: user.email,
          subject: 'CrespoTradersClub Account Activation',
          text: text
        })
  
        user.updatedAt = new Date()
        await userRepo.save(user)
  
        resolve(user)
      } else {
        reject(new AppError({
          message: 'Cannot resend confirmation mail!',
          status: 400
        }))
      }
    } catch (error) {
      console.log(error)
      reject(new AppError({
        message: 'An unexpected error occured!',
        status: 500
      }))
    }
  })
}

export async function fetchUser (query:any):Promise<User> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: query.id },
      { email: query.email },
      { username: query.username }
    ],
    select: [
      'id',
      'email',
      'passhash',
      'fullName',
      'username',
      'balance',
      'bonusBalance',
      'btcAddress',
      'role',
      'status',
      'createdAt',
      'updatedAt'
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      resolve(user)
    } else reject(new AppError({
      message: 'User not found!',
      status: 401
    }))
  })
}

export async function updateUser (query:ProfileUpdatePayload):Promise<User> {
  const userRepo = getRepository(User)

  const user = await userRepo.findOne({
    where: [
      { id: query.id }
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      user.fullName = query.fullName
      user.btcAddress = query.btcAddress

      userRepo.save(user).then( user => {
        if (user.email !== query.email) {
          const tokenRepo = getRepository(Token)
  
          tokenRepo.save(tokenRepo.create({
            userId: user.id,
            token: crypto({ length: 16 }),
            meta: query.email
          })).then(token => {
            const clientHost = config.get('server.clientHost')
            const verificationLink = `${clientHost}/email_update?tokenId=${token.id}&userId=${user.id}`
            const text = `
            Hello, ${user.fullName}. 
            Click on the following link to update your e-mail: 
            <a href="${verificationLink}">${verificationLink}</a>
            `
  
            mailService.send({
              to: user.email,
              subject: 'CrespoTradersClub E-mail Update',
              text: text
            })

            resolve(user)
          }).catch(err => {
            console.log(err)
            reject(new AppError({
              message: 'An unexpected error occured!',
              status: 500
            }))
          })
        } else {
          resolve(user)
        }
      }).catch(err => reject(new AppError({
        message: 'An error occured',
        status: 500
      })))
    } else reject(new AppError({
      message: 'User not found!',
      status: 403
    }))
  })
}

export async function updatePassword (query:PasswordUpdatePayload):Promise<User> {
  const userRepo = getRepository(User)

  const user = await userRepo.findOne({
    where: [
      { id: query.id }
    ],
    select: [
      'id',
      'passhash'
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      bcrypt.compare(query.currentPassword, user.passhash, (err:any, same:boolean) => {
        if (!same) reject(new AppError({
          message: 'Password does not match!',
          status: 400
        }))

        bcrypt.hash(query.newPassword, 8, (err:any, passhash:any) => {
          if (err) reject(new AppError({
            message: 'An unexpected error occured!',
            status: 500
          }))

          user.passhash = passhash

          userRepo.save(user).then(user => {
            resolve(user)
          }).catch(err => reject(new AppError({
            message: 'An error occured',
            status: 500
          })))
        })
      })
    } else reject(new AppError({
      message: 'User not found!',
      status: 403
    }))
  })
}

export async function updateEmail (query:{ userId:string, tokenId:string }):Promise<User> {
  const userRepo = getRepository(User)
  const tokenRepo = getRepository(Token)

  const user = await userRepo.findOne({
    where: [
      { id: query.userId }
    ],
    select: [
      'id',
      'passhash'
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      tokenRepo.findOne(query.tokenId)
        .then(token => {
          if (token) {
            if (token.userId !== user.id) return reject(new AppError({
              message: 'Invalid operation!',
              status: 400
            }))

            user.email = token.meta
            userRepo.save(user)
              .then(user => resolve(user))
              .catch(err => reject(new AppError({
                message: 'Token expired',
                status: 400
              })))
          } else {
            reject(new AppError({
              message: 'Token expired',
              status: 400
            }))
          }
        }).catch(err =>  reject(new AppError({
          message: 'An unexpected error occured!',
          status: 500
        })))
     
    } else reject(new AppError({
      message: 'User not found!',
      status: 403
    }))
  })
}

export async function fetchUserProfile (query:any):Promise<any> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: query.id },
      { email: query.email },
      { username: query.username }
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      resolve({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        btcAddress: user.btcAddress,
        tfaEnabled: user.tfaEnabled
      })
    } else reject(new AppError({
      message: 'User not found!',
      status: 403
    }))
  })
}

export async function transferFund (query:any):Promise<any> {
  if (new BigNumber(query.amount).isLessThan(1)) return Promise.reject(
    new AppError({
      message: 'Amount must be greater than 0.99!',
      status: 400
    })
  )

  return new Promise((resolve, reject) => {
    getConnection().transaction('SERIALIZABLE', async txEntityManager => {
      const benefactor = await txEntityManager.findOne(User, query.benefactorId, {
        select: [
          'id',
          'passhash',
          'balance'
        ]
      })
      const beneficiary = await txEntityManager.findOne(User, {
        where: { username: query.beneficiaryUsername }
      })

      const same = await bcrypt.compare(query.benefactorPassword, benefactor!.passhash)

      if (!same) reject(new AppError({
        message: 'Password is incorrect!',
        status: 400
      }))
  
      if (!beneficiary) return reject(new AppError({
        message: 'Beneficiary not found!',
        status: 400
      }))
  
      if (benefactor!.id === beneficiary.id) return reject(new AppError({
        message: 'Cannot transfer to self!',
        status: 400
      }))

      if (new BigNumber(benefactor!.balance).isLessThan(query.amount)) return reject(
        new AppError({
          message: 'Balance is less than amount!',
          status: 400
        })
      )

      benefactor!.balance = new BigNumber(benefactor!.balance).minus(query.amount).toString()
      beneficiary.balance = new BigNumber(beneficiary.balance).plus(query.amount).toString()

      resolve(await Promise.all([
        txEntityManager.save(benefactor),
        txEntityManager.save(beneficiary),
        txEntityManager.insert(Deposit, {
          userId: beneficiary.id,
          benefactorId: benefactor!.id,
          amount: query.amount,
          status: DepositStatus.COMPLETED
        }),
        txEntityManager.insert(Withdrawal, {
          userId: benefactor!.id,
          beneficiaryId: beneficiary.id,
          amount: query.amount,
          status: WithdrawalStatus.COMPLETED
        })
      ]))
    })
    .catch(err => {
      console.log(err)
      reject(
        new AppError({
          message: 'Transaction error!',
          status: 500
        })
      )
    })
  })
}

export async function deleteUser (fields:any):Promise<User> {
  const userRepo = getRepository(User)
  const user = await userRepo.findOne({
    where: [
      { id: fields.id },
      { email: fields.email }
    ]
  })

  return new Promise((resolve, reject) => {
    if (user) {
      if (user.status === UserStatus.DELETED) {
        return reject(new AppError({ message: 'Account is already deactivated!', status: 403 }))
      }

      user.status = UserStatus.DELETED
      resolve(userRepo.save(user))
    }
  
    reject(new AppError({ message: 'Not found!', status: 404 }))
  })
}