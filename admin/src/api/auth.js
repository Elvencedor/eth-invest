import axios from 'axios'

export const register = (data) => {
  return axios.post('/users', data)
}

export const login = ({ login, password, token }) => {
  const headerOptions = {}

  if (token) {
    headerOptions['x-otp'] = token
  }

  return axios.post('/session', { login, password }, {
    headers: headerOptions
  })
}

export const logout = () => {
  return axios.delete('/session')
}
