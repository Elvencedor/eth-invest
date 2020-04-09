import { plans } from '@/api/plan'

export default {
  namespaced: true,
  state: {
    error: null,
    plans: []
  },
  mutations: {
    setPlans: (state, plans) => {
      state.plans = plans
    },

    setError: (state, error) => {
      state.error = error
    }
  },
  actions: {
    plans: async ({ commit }) => {
      try {
        const res = await plans()
        commit('setPlans', res.data.data)
      } catch (error) {
        const errors = error.response.data.errors

        commit('setError', errors)

        throw errors
      }
    }
  },
  getters: {
    plans: state => {
      return state.plans
    }
  }
}
