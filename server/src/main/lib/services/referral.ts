import { getRepository, Like } from 'typeorm'
import { Referral } from '../../db/entity/Referral'
import { Pagination, PaginationOptionsInterface } from '../pagination'
import BigNumber from 'bignumber.js'

export async function fetchReferralsByReferrerId (query:any, options:PaginationOptionsInterface):Promise<Pagination<Referral>> {
  const searchQuery = query.search || ''
  const referralRepo = getRepository(Referral)

  try {
    const [referrals, count] = await referralRepo.createQueryBuilder('referral')
      .innerJoinAndSelect('referral.user', 'user', 'user.username like :name', { name: '%' + searchQuery + '%' })
      .where('referrerId = :id', { id: query.referrerId })
      .skip(options.limit * (options.page - 1))
      .take(options.limit)
      .orderBy('referral.createdAt', 'DESC')
      .getManyAndCount()

    return new Pagination<Referral>({
      results: referrals,
      current: options.page,
      perPage: options.limit,
      total: count,
    }, options)
  } catch (err) {
    throw err
  }
}

export async function computeReferralStats (userId:string) {
  const referralRepo = getRepository(Referral)
  const [referrals, count] = await referralRepo.findAndCount({
    where: { referrerId: userId }
  })
  let totalBonus = new BigNumber(0)

  for (const referral of referrals) {
    totalBonus = totalBonus.plus(referral.bonus)
  }

  return {
    referralsCount: count,
    bonusTotal: totalBonus.toString()
  }
}

