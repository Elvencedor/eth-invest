import config from 'config'
import BigNumber from 'bignumber.js'
import { getRepository, getConnection, Like } from 'typeorm'
import { Deposit, DepositStatus } from '../../db/entity/Deposit';
import { AppError } from '../errors/AppError'
import { NewDepositPayload, DepositUpdatePayload, ERC20Contract} from '../../../ts/types'
import * as etherscan from './etherscan'
import { User } from '../../db/entity/User'
import { Referral } from '../../db/entity/Referral'
import { Pagination, PaginationOptionsInterface } from '../pagination'
import * as store from '../store'

export async function fetchDeposits (query:any, options: PaginationOptionsInterface):Promise<Pagination<Deposit>> {
  const searchQuery = query.search || ''
  const depositRepo = getRepository(Deposit)

  const [deposits, total] = await depositRepo.createQueryBuilder('deposit')
    .leftJoinAndSelect(
      'deposit.benefactor',
      'benefactor'
    )
    .select([
      'benefactor.id',
      'benefactor.username',
      'deposit.id',
      'deposit.status',
      'deposit.txid',
      'deposit.amount',
      'deposit.assetAmount',
      'deposit.createdAt',
      'deposit.updatedAt'
    ])
    .where('deposit.userId = :id', { id: query.userId })
    // .orWhere('deposit.id like :idStr', { idStr: '%' + searchQuery + '%' })
    .skip(options.limit * (options.page - 1))
    .take(options.limit)
    .orderBy('deposit.createdAt', 'DESC')
    .getManyAndCount()
  
  return new Promise((resolve, reject) => {
    if (deposits) {
      resolve(new Pagination<Deposit>({
        results: deposits,
        current: options.page,
        perPage: options.limit,
        total: total,
      }, options))
    } else reject(new AppError({
      message: 'Deposits not found!',
      status: 403
    }))
  })
}

export async function fetchPendingDeposits (query:any):Promise<Deposit[]> {
  const depositRepo = getRepository(Deposit)
  const deposits = await depositRepo.find({
    where: [
      { userId: query.userId, status: DepositStatus.PENDING },
    ]
  })
  
  return new Promise((resolve, reject) => {
    if (deposits) {
      resolve(deposits)
    } else reject(new AppError({
      message: 'Deposits not found!',
      status: 403
    }))
  })
}

export async function createDeposit (fields: NewDepositPayload):Promise<any> {
  const depositRepo = getRepository(Deposit)
  
  return new Promise(async (resolve, reject) => { 
    // then Convert USD to asset of choice amount
    let assetAmount = convertNgnToAsset(fields.amount)
    const conflictingDeposit = depositRepo.findOne({
      where: {
        assetAmount,
        status: DepositStatus.PENDING
      }
    })
  
    if (conflictingDeposit) {
      const amt = new BigNumber(assetAmount)
      const pre: number = config.get('cryptocurrency.ethereum.erc20Contracts.ETH.precision')
      const add = `0.${'0'.repeat(pre)}1`
      assetAmount = amt.plus(add).toFormat(4)
    }
    
    depositRepo.save(depositRepo.create({
      userId: fields.userId,
      amount: fields.amount,
      assetAmount
    }))
    .then(deposit => resolve(deposit))
    .catch(err => reject(new AppError({
      message: 'An unexpected error occured!',
      status: 500
    })))
  })
}

export async function fetchDepositById(id: string): Promise<any>{
  const depositRepo = getRepository(Deposit)

  const deposit = await depositRepo.find({
    where: [
      {id: id}
    ]
  })
  
  return new Promise((resolve,reject) => {
    if (deposit) {
      resolve(deposit)
    } else {
      return reject(new AppError({
        message: 'Deposit not found!',
        status: 403
      }))
    }
  })
}

export async function updateDeposit (id: string, fields: DepositUpdatePayload):Promise<any> {
  return new Promise((resolve, reject) => {
    getConnection().transaction('SERIALIZABLE', async txEntityManager => {
      const deposit:Deposit|undefined = await txEntityManager.findOne(Deposit, id)
      
      if (deposit) {
        if (deposit.status === DepositStatus.COMPLETED) {
          return reject(new AppError({
            message: 'Deposit was already verified!',
            status: 403
          }))
        }

        if (deposit.status === DepositStatus.CANCELLED) {
          return reject(new AppError({
            message: 'Can not submit TXID to cancelled deposit!',
            status: 403
          }))
        }

        await etherscan.getTransactionByHash(fields.txid)
          .then(async tx => {
            if (tx) {
              const mainWallet = config.get('cryptocurrency.ethereum.mainWallet')
              const contract:ERC20Contract = config.get('cryptocurrency.ethereum.erc20Contracts.ETH')
              
              const amount = new BigNumber(tx.value).div(Math.pow(10, contract.precision)).toFormat(4)
              const beneficiary = tx.to

              await etherscan.getTransactionReceipt(fields.txid)
              .then(async txReceipt => {
                if (txReceipt) {
                  if(new BigNumber(txReceipt.blockNumber).isLessThan(config.get('cryptocurrency.ethereum.blockLowerBound'))) {
                    return reject(new AppError({
                      message: 'Invalid/dated transaction!',
                      status: 423
                    }))
                  }

                  if(new BigNumber(txReceipt.status).toString() !== '1') {
                    return reject(new AppError({
                      message: 'Failed transaction!',
                      status: 423
                    }))
                  }
                  
                  if (
                    String(beneficiary).toUpperCase() !==
                    String(mainWallet).toUpperCase()
                  ) {
                    return reject(
                      new AppError({
                        message: "Invalid transaction beneficiary!",
                        status: 423,
                      })
                    );
                  }

                  if (amount !== deposit.assetAmount) {
                    return reject(
                      new AppError({
                        message:
                          "Transacted amount and deposit amount do not match!",
                        status: 423,
                      })
                    );
                  }

                    await getConnection().transaction(
                      "SERIALIZABLE",
                      async (txEntityManager) => {
                        const user = await txEntityManager.findOne(
                          User,
                          deposit.userId
                        );

                        if (user) {
                          const userBalance = new BigNumber(user!.balance)
                            .plus(deposit.amount)
                            .toString();

                          console.log({
                            status: new BigNumber(txReceipt.status).toString(),
                          });
                          try {
                            await txEntityManager.update(Deposit, deposit.id, {
                              txid: fields.txid,
                              status: DepositStatus.COMPLETED,
                            });
                          } catch (error) {
                            if (error.code === '23505') {
                              return reject(
                                new AppError({
                                  message: "Unacceptable transaction! - Transaction id has already been claimed.",
                                  status: 403,
                                })
                              );
                            }

                            return reject(
                              new AppError({
                                message: "An unexpected error occured! ",
                                status: 500,
                              })
                            );
                          }

                          await txEntityManager.update(User, user!.id, {
                            balance: userBalance,
                          });
                        } else {
                          return reject(
                            new AppError({
                              message: "user does not exist",
                              status: 403,
                            })
                          );
                        }

                        const referral = await txEntityManager.findOne(
                          Referral,
                          {
                            relations: ["referrer"],
                            where: { userId: user!.id },
                          }
                        );

                        if (referral) {
                          const referrer = referral!.referrer;
                          const referrerBonusPercentage: number = config.get(
                            "misc.refPercentage"
                          );
                          const referrerBonus = new BigNumber(deposit.amount)
                            .times(referrerBonusPercentage)
                            .div(100);

                          referrer.bonusBalance = referrerBonus
                            .plus(referrer.bonusBalance)
                            .toString();
                          referral.bonus = referrerBonus
                            .plus(referral.bonus)
                            .toString();

                          await txEntityManager.save(referrer);
                          await txEntityManager.save(referral);
                        }

                        deposit.txid = fields.txid;
                        deposit.status = DepositStatus.COMPLETED;

                        resolve(deposit);
                      }
                    );

                } else reject(new AppError({
                  message: 'Invalid transaction receipt!',
                  status: 423
                }))
              })
                .catch(err => {
                  console.log(err)
                  reject(new AppError({
                    message: 'An unexpected error occured!',
                    status: 500
                  }))
                })
            } else reject(new AppError({
              message: 'Invalid transaction!',
              status: 423
            }))
          })
          .catch(err => {
            console.log(err)
            reject(new AppError({
              message: 'An unexpected error occured!',
              status: 500
            }))
          })
          resolve(deposit)
      } else reject(new AppError({
        message: 'Invalid deposit ID!',
        status: 421
      }))
    })
      .catch(err => {
        console.log(err)
        reject(new AppError({
          message: 'An unexpected error occured!',
          status: 500
        }))
      })
  })
}

export function convertNgnToAsset (amount:string): string {
  const oneEthToUsdPrice = store.get('exchangeRates')['ethusd']
  const oneNgnToUsdPrice = store.get('forexRates')['ngnusd']

  // get equivalent value of user deposit in USD
  const equivalentValue = oneNgnToUsdPrice * Number(amount)
  return new BigNumber(equivalentValue / oneEthToUsdPrice).toFormat(4)
}
