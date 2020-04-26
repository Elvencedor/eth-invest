import {Request, Response} from 'express'
import * as referralService from '../../services/referral'
import {respond} from '../../respond'

export async function fetchUserReferrals (req: Request, res: Response) {
  referralService.fetchReferralsByReferrerId({
    referrerId: req.session!.user.id,
    search: req.query.search
  },
  {
    limit: Number(req.query.limit || 10),
    page: Number(req.query.page || 1)
  })
    .then(async result => {
      respond(res, 200, null, result.results, { 
        count: result.total,
        pagination: result.pagination,
        stats: await referralService.computeReferralStats(req.session!.user.id)
      })
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}
