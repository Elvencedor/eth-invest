import fetch from 'node-fetch'
import config from 'config'
import * as store from '../store'

export async function getRates () {
  const apiUrl = `https://www.freeforexapi.com/api/live?pairs=USDNGN`
  const res = await fetch(`${apiUrl}`, {method: 'GET'})
  return res.json()
}

export async function storeRates (): Promise<any> {
  return new Promise((resolve,reject) => {
    getRates()
    .then(rates => {
      const NGN_USDPrice = 1 / rates.rates.USDNGN.rate
      store.set('forexRates', {'ngnusd': NGN_USDPrice})

      resolve()
    })
    .catch(err => reject(err))
  })
}

export async function init () {
  // Init worker
  console.log('Init FreeForexAPI worker...')

  setInterval (() => {
    storeRates()
  }, config.get('cryptocurrency.southxchange.requestTimer'))

  return storeRates()
}