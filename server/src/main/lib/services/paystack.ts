import config from 'config'
import { getRepository, getConnection, Like } from 'typeorm'
import { paystackPayload } from '../../../ts/types'
import { AppError } from '../errors/AppError'
import { Deposit, DepositStatus } from '../../db/entity/Deposit'
import { User } from '../../db/entity/User'
import { Referral } from '../../db/entity/Referral'
import BigNumber from 'bignumber.js'
import * as store from '../store'


export async function saveTransaction(fields:paystackPayload):Promise<any>{
    return new Promise((resolve, reject) => {
        const txRepo = getRepository(Deposit)
        const assetAmount = convertNgnToAsset(fields.amount)
        txRepo.save(txRepo.create(
            {
                userId: fields.userId,
                amount: fields.amount,
                assetAmount: assetAmount,
                txid: fields.reference,
                status: DepositStatus.COMPLETED
            }
        ))
        .then(deposit => resolve(deposit))
        .catch(err => reject(new AppError({
            message: 'An unexpected error occurred',
            status: 500
        })))

        getConnection().transaction('SERIALIZABLE', async txEntityManager => {
            const user:User|undefined = await txEntityManager.findOne(User, fields.userId)
            if(user) {
                const userBalance = new BigNumber(user!.balance)
                .plus(fields.amount)
                .toString()
                
                await txEntityManager.update(User, user!.id, {
                    balance: userBalance
                  })
            }else{
                return reject(new AppError({
                    message: 'user does not exist',
                    status: 403
                }))
            }

            const referral = await txEntityManager.findOne(
                Referral,
                {
                  relations: ['referrer'],
                  where: { userId: user!.id }
                }
              )

              if (referral) {
                const referrer = referral!.referrer
                const referrerBonusPercentage:number = config.get('misc.refPercentage')
                const referrerBonus = new BigNumber(fields.amount).times(referrerBonusPercentage).div(100)

                referrer.bonusBalance = referrerBonus.plus(referrer.bonusBalance).toString()
                referral.bonus = referrerBonus.plus(referral.bonus).toString()

                await txEntityManager.save(referrer)
                await txEntityManager.save(referral)
              }
        })       
    })
}

export function convertNgnToAsset (amount:string): string {
const oneEthToUsdPrice = store.get('exchangeRates')['ethusd']
const oneNgnToUsdPrice = store.get('forexRates')['ngnusd']
console.log(oneEthToUsdPrice)
// get equivalent value of user deposit in USD
const equivalentValue = oneNgnToUsdPrice * Number(amount)

return (equivalentValue / oneEthToUsdPrice).toString(10)
}
