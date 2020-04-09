import axios from 'axios'

export const plans = () => {
  return axios.get('/plans')
}
