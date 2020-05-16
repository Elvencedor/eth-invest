import fetch from 'node-fetch'
import config from 'config'
import * as store from '../store'
const apiUrl = `https://www.southxchange.com/api`

export const getTickers = async (tickers: string[]) => {
  try {
    const res1 = await fetch(`${apiUrl}/price/${tickers[0]}`, {
      method: 'GET'
    })
    const obj1 = await res1.json()
    const res2 = await fetch(`${apiUrl}/price/${tickers[1]}`, {
      method: 'GET'
    })
    const obj2 = await res2.json()

    return [obj1, obj2]
  } catch (err) {
    throw new Error(err)
  }
}

export async function callApi () {
  return new Promise((resolve, reject) => {
    getTickers(['ETH/USD', 'BTC/USD'])
      .then(tickers => {
        const ETH_USDPrice = tickers[0].Last
        const BTC_USDPrice = tickers[1].Last

        store.set('exchangeRates', {
          'btcusd': BTC_USDPrice,
          'ethusd': ETH_USDPrice
        })

        resolve()
      })
      .catch(err => reject(err))
  })
}

export async function init () {
  // Init worker
  console.log('Init SouthXchange worker...')

  setInterval (() => {
    callApi()
  }, config.get('cryptocurrency.southxchange.requestTimer'))

  return callApi()
}