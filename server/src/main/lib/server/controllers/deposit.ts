import config from 'config'
import {Request, Response, response} from 'express'
import v from 'validator'
import * as depositService from '../../services/deposit'
import * as QRCode from 'qrcode'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'
import BigNumber from 'bignumber.js'

export async function fetchDeposit (req: Request, res: Response) {
  depositService.fetchDeposits({
    userId: req.session!.user.id,
    search: req.query.search
  },
  {
    limit: Number(req.query.limit || 10),
    page: Number(req.query.page || 1)
  })
    .then(async result => {
      const newDeposits: Object[] = []

      const depositAddress: string = config.get('cryptocurrency.ethereum.mainWallet')

      try {
        const dataURL = await QRCode.toDataURL(depositAddress)

        result.results.forEach((deposit) => {
          newDeposits.push({ ...deposit, address: depositAddress, url: dataURL })
        })

        respond(res, 200, null, newDeposits, { 
          count: result.total,
          pagination: result.pagination
        })
      } catch (err) {
        const error = new AppError({
          message: 'Server error.',
          status: 500
        })
        respond(res, error.getStatus(), [error])
      }
    })
    .catch(err => {
      console.log(err)
      respond(res, err.getStatus(), [err])
    })
}

export async function createDeposit (req: Request, res: Response) {
  if (!config.get('misc.enableFeature.deposit')) {
    return respond(res, 400, [new AppError({ message: 'Deposit has been disabled by administrator!', status: 400 })])
  }

  if (v.isEmpty(req.body.amount || '')) {
    return respond(res, 400, [new AppError({ message: 'Amount can not be empty!', status: 400 })])
  }

  if (new BigNumber(req.body.amount).isNaN()) {
    return respond(res, 400, [new AppError({ message: 'Amount is invalid!', status: 400 })])
  }

  if (new BigNumber(req.body.amount || 0).isLessThan(config.get('misc.limit.deposit.min'))) {
    return respond(res, 400, [new AppError({ message: `Minimum deposit amount: $${new BigNumber(config.get('misc.limit.deposit.min')).toFormat(2)}!`, status: 400 })])
  }

  const userId = req.session!.user.id

  try {
    const pendingUserDesposits = await depositService.fetchPendingDeposits({ userId })

    if (!pendingUserDesposits.length) {
      depositService.createDeposit({
        userId,
        amount: req.body.amount
      })
        .then(deposit => {
          const depositAddress: string = config.get('cryptocurrency.ethereum.mainWallet')
      
          QRCode.toDataURL(depositAddress).then(dataURL => {
            respond(res, 200, null, {
              ...deposit,
              address: depositAddress,
              url: dataURL
            })
          }).catch(err => {
            const error = new AppError({
              message: 'Server error.',
              status: 500
            })
            respond(res, error.getStatus(), [error])
          })
        })
        .catch(err => {
          respond(res, err.getStatus(), [err])
        })
    } else {
      const error = new AppError({
        message: 'You have pending deposit. Confirm them and proceed.',
        status: 400
      })
      respond(res, error.getStatus(), [error])
    }
  } catch (err) {
    respond(res, err.getStatus(), [err])
  }
}

export async function updateDeposit (req: Request, res: Response) {
  if (v.isEmpty(req.body.txid || '')) {
    return respond(res, 400, [new AppError({ message: 'Transaction hash can not be empty!', status: 400 })])
  }
  
  depositService.updateDeposit(req.params.id, {
    txid: req.body.txid
  })
    .then(deposit => {
      if(deposit){
        const depositAddress: string = config.get('cryptocurrency.ethereum.mainWallet')

        QRCode.toDataURL(depositAddress).then(dataURL => {
          respond(res, 200, null, {
            ...deposit,
            address: depositAddress,
            url: dataURL
          })
        }).catch(err => {
          const error = new AppError({
            message: 'Server error.',
            status: 500
          })

          respond(res, error.getStatus(), [error])
        })
      } else {
        const error = new AppError({
          message: 'SOmething just happened right now',
          status: 500
        })

        respond(res, error.getStatus(), [error])
      }
      
    })
    .catch(err => {

      respond(res, err.getStatus(), [err])
    })
}