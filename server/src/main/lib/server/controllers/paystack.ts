import {Request, Response} from 'express'
import v from 'validator'
import * as paystackService from '../../services/paystack'
import {respond} from '../../respond'
import { AppError } from '../../errors/AppError'
import BigNumber from 'bignumber.js'

export async function createTx(req: Request, res: Response){
    if(v.isEmpty(req.body.amount || '')){
        return respond(res, 400, [new AppError({message: 'Amount cannot be empty', status: 400})])
    }

    if(new BigNumber(req.body.amount).isNaN()){
        return respond(res, 400, [new AppError({message: 'Amount is invalid', status: 400})])
    }

    paystackService.saveTransaction({
        amount: req.body.amount,
        reference: req.body.reference,
        userId: req.session!.user.id
    })
}