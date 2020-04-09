import Vue from 'vue'
import axios from 'axios'
import Vuelidate from 'vuelidate'
import izitoast from 'izitoast'
import router from './router'
import store from './store'
import App from './App.vue'
import * as dotenv from 'dotenv'

import '@fortawesome/fontawesome-free/css/all.css'
import 'izitoast/dist/css/iziToast.min.css'
import '@/assets/css/main.css'

import '@glidejs/glide/dist/css/glide.core.min.css'
import '@glidejs/glide/dist/css/glide.theme.min.css'

Vue.use(Vuelidate)

Vue.config.productionTip = false

dotenv.config()

// Set baseURL for axios request
axios.defaults.baseURL = `${process.env.VUE_APP_API_HOST}/api`

// Make axios send cookies by default
axios.defaults.withCredentials = true

// Add a 401 response interceptor
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  // Check for 401 response
  if (error.response && error.response.status === 401) {
    izitoast.error({
      title: 'Error',
      message: 'User session expired. Login to continue.'
    })

    store.dispatch('auth/clear')
    router.replace({ name: 'login' })
  }

  return Promise.reject(error)
})

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
