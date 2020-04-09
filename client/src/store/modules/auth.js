/* global localStorage */

import { login, register, self, logout } from '@/api/auth'

export default {
  namespaced: true,
  state: {
    error: null,
    user: {},
    loggedIn: localStorage.getItem('loggedIn') || false
  },
  mutations: {
    setAuth: (state) => {
      state.loggedIn = true
    },

    setUser: (state, user) => {
      state.user = user
    },

    setError: (state, error) => {
      state.error = error
    },

    setLogout: (state) => {
      state.user = {}
      state.loggedIn = false
      localStorage.removeItem('loggedIn')
    }
  },
  actions: {
    login: async ({ commit }, data) => {
      try {
        const res = await login(data)

        if (res.status === 206) {
          return res
        }

        localStorage.setItem('loggedIn', true)
        commit('setAuth')

        return res
      } catch (error) {
        commit('setError', error.response.data.errors)

        throw error
      }
    },

    self: async ({ commit }) => {
      try {
        const res = await self()

        commit('setUser', res.data.data)

        return res
      } catch (error) {
        commit('setError', error.response.data.errors)

        throw error
      }
    },

    register: async ({ commit }, data) => {
      try {
        await register(data)
      } catch (error) {
        commit('setError', error.response.data.errors)

        throw error
      }
    },

    logout: async ({ commit }) => {
      try {
        await logout()

        commit('setLogout')
      } catch (error) {
        commit('setError', error.response.data.message)

        throw error
      }
    },

    clear: async ({ commit }) => {
      commit('setLogout')
    }
  },
  getters: {
    user: state => {
      return state.user
    },

    loggedIn: state => {
      return state.loggedIn
    }
  }
}
