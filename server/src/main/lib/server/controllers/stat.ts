import {Request, Response} from 'express'
import BigNumber from 'bignumber.js'
import * as withdrawalService from '../../services/withdrawal'
import * as investmentService from '../../services/investment'
import {respond} from '../../respond'
import moment from 'moment'
import * as store from '../../store'

export async function fetchStats (req: Request, res: Response) {
  const userId = req.session!.user.id

  return Promise.all([
    withdrawalService.fetchPendingWithdrawals({ userId }),
    investmentService.fetchRunningInvestments({ userId })
  ])
    .then(results => {
      const runningInvestments = results[1]
      const growingBalance = (
        runningInvestments
          .reduce(
            (acc, inv) => {
              const projectedBalance = new BigNumber(inv.amount)
                .times(inv.percentage)
                .div(100)
                .plus(inv.amount)
              const frag = projectedBalance.div(inv.duration)
              const start = moment(inv.createdAt)
              const elapsedDuration = moment.duration(moment().diff(start)).asDays()
              const elapsedBalance = frag.times(elapsedDuration)

              return acc.plus(elapsedBalance)
            },
            new BigNumber(0)
          )
      ).toString()
      
      respond(res, 200, null, {
        pendingWithdrawalCount: results[0].length,
        runningInvestmentsCount: results[1].length,
        growingBalance
      })
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}

export async function fetchConversion (req: Request, res: Response) {
  const oneBtcToUsdPrice = store.get('exchangeRates')['btcusd']
  const oneCsoToBtcPrice = store.get('exchangeRates')['csobtc']
      
  respond(res, 200, null, {
    oneBtcToUsdPrice,
    oneCsoToBtcPrice
  })
}