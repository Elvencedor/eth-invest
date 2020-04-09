import { getRepository, getConnection, Like } from 'typeorm'
import {donorPayload} from '../../../ts/types'
import { AppError } from '../errors/AppError'
import { donor } from '../../db/entity/donor'

export async function saveTransaction(fields: donorPayload): Promise<any>{
    return new Promise((resolve, reject) => {
        const txRepo = getRepository(donor)
        txRepo.save(txRepo.create({
            email: fields.email,
            amount: fields.amount,
            reference: fields.reference,
            userId: fields.userId
        }))
        .then(deposit => resolve(deposit))
        .catch(err => reject(new AppError({
            message: 'An unexpected error occurred',
            status: 500
        })))
    })
    
}