import Vue from 'vue'
import Vuex from 'vuex'

import auth from './modules/auth'
import plan from './modules/plan'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: {
    auth,
    plan
  }
})
