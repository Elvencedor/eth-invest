import fetch from 'node-fetch'
import config from 'config'
import * as store from '../store'
const apiUrl = `https://api.crex24.com/v2/public`

export const getTickers = async (tickers: string[]) => {
  try {
    const res = await fetch(`${apiUrl}/tickers?instrument=${tickers.toString()}`, {
      method: 'GET'
    })
    const obj = await res.json()

    return obj
  } catch (err) {
    throw new Error(err)
  }
}

export async function callApi () {
  return new Promise((resolve, reject) => {
    getTickers(['ETH-BTC', 'BTC-USD'])
      .then(tickers => {
        const BTC_USDPrice = tickers[0].last
        const ETH_BTCPrice = tickers[1].last

        store.set('exchangeRates', {
          'btcusd': BTC_USDPrice,
          'csobtc': ETH_BTCPrice
        })

        resolve()
      })
      .catch(err => reject(err))
  })
}

export async function init () {
  // Init worker
  console.log('Init Crex24 worker...')

  setInterval (() => {
    callApi()
  }, config.get('cryptocurrency.crex24.requestTimer'))

  return callApi()
}