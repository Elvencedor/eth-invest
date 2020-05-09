import Vue from 'vue'
import axios from 'axios'
import Vuelidate from 'vuelidate'
import izitoast from 'izitoast'
import Tawk from 'vue-tawk'
import router from './router'
import store from './store'
import App from './App.vue'
import * as dotenv from 'dotenv'

import '@fortawesome/fontawesome-free/css/all.css'
import 'izitoast/dist/css/iziToast.min.css'
import '@/assets/css/main.css'

import '@glidejs/glide/dist/css/glide.core.min.css'
import '@glidejs/glide/dist/css/glide.theme.min.css'

dotenv.config()
Vue.use(Vuelidate)
Vue.use(Tawk, {
  tawkSrc: process.env.VUE_APP_TAWK_SRC
})

Vue.config.productionTip = false

// Set baseURL for axios request
axios.defaults.baseURL = `http://localhost:3000/api`
// Make axios send cookies by default
axios.defaults.withCredentials = true

// Add a 401 response interceptor
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (!error.response) {
    izitoast.error({
      title: 'Error',
      message: `Could not connect to server. Please try later.`
    })
  }
  // Check for 401 response
  if (error.response && error.response.status === 401) {
    store.dispatch('auth/clear')
    router.replace({ name: 'login' })

    izitoast.error({
      title: 'Error',
      message: 'User session expired. Login to continue.'
    })
  }

  return Promise.reject(error)
})

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
