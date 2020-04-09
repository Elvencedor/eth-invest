import {Request, Response} from 'express'
import * as planService from '../../services/plan'
import {respond} from '../../respond'

export async function fetchPlans (req: Request, res: Response) {
  planService.fetchPlans()
    .then(plans => {
      respond(res, 200, null, plans)
    })
    .catch(err => {
      respond(res, err.getStatus(), [err])
    })
}