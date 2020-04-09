import config from 'config'
import fetch from 'node-fetch'
const network = config.get('cryptocurrency.etherscan.network')
const subdomain = network === 'mainnet'
  ? 'api'
  : `api-${network}`
const apiUrl = `https://${subdomain}.etherscan.io/api`
const apiKey = config.get('cryptocurrency.etherscan.apiKey')

export const getTransactionByHash = async (txid: string) => {
  try {
    const res = await fetch(`${apiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txid}&apikey=${apiKey}`, {
      method: 'GET'
    })
    const obj = await res.json()

    return obj.result
  } catch (err) {
    throw new Error(err)
  }
}

export const getTransactionReceipt = async (txid: string) => {
  try {
    const res = await fetch(`${apiUrl}/?module=proxy&action=eth_getTransactionReceipt&txhash=${txid}&apikey=${apiKey}`, {
      method: 'GET'
    })
    const obj = await res.json()

    return obj.result
  } catch (err) {
    throw new Error(err)
  }
}