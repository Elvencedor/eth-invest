<template>
  <section class="flex justify-center items-center flex-col py-20 px-6 sm:px-0 bg-gray-100 min-h-screen">
    <h1 class="text-3xl text-gray-900">Login</h1>
    <div class="w-full max-w-lg">
      <form @submit.prevent="loginRequest()" class="bg-white shadow-lg p-6 rounded-lg mt-10">
        <div>
          <label for="login" class="text-gray-900">E-mail/Username</label>
          <input type="text" v-model="$v.form.login.$model" class="mt-3 w-full rounded-lg py-3 px-6 border-2 border-gray-200 text-gray-600" id="login" placeholder="e.g johndoe@domain.com">
          <p class="text-xs text-red-500 italic" v-if="$v.form.login.$error && !$v.form.login.required">E-mail/Username is required</p>
        </div>
        <div class="mt-6">
          <div class="flex justify-between items-center">
            <label for="password" class="text-gray-900">Password</label>
            <router-link to="/forgot_password" class="text-gray-900 underline text-sm">Forgot password?</router-link>
          </div>
          <input type="password" v-model="$v.form.password.$model" class="mt-3 w-full rounded-lg py-3 px-6 border-2 border-gray-200 text-gray-600" id="password" placeholder="**********">
          <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.required">Password is required</p>
        </div>
        <div v-if="tfaFlag" class="mt-6">
          <label for="token" class="text-gray-900">Token (OTP)</label>
          <input type="text" v-model.trim="$v.form.token.$model" class="mt-3 w-full rounded-lg py-3 px-6 border-2 border-gray-200 text-gray-600" id="token">
          <p class="text-red-500 text-xs italic" v-if="$v.form.token.$error && !$v.form.token.required">Token is required</p>
        </div>
        <div class="mt-6">
          <button
            type="submit"
            class="mt-3 w-full shadow rounded-lg py-3 px-6 bg-green-500 text-gray-900 hover:bg-green-400 disabled:opacity-50"
            :disabled="loading"
          >
          <span v-if="loading" class="fas fa-spinner fa-spin"> </span>
            Login to your account
          </button>
        </div>
      </form>
      <p class="mt-10 text-center text-sm px-6 text-gray-900">
        Didn't receive our activation/welcome email? <br >
        <router-link to="/resend_confirmation" class="text-gray-900 underline">Resend here</router-link>.
      </p>
      <div class="mt-6">
        <router-link
          to="/register"
          class="block text-center text-green-500 shadow rounded-lg py-3 px-6 border-2 border-green-500 hover:bg-green-500 hover:text-gray-900"
        >
          Register new account
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import izitoast from 'izitoast'
import { required } from 'vuelidate/lib/validators'
export default {
  name: 'login',
  data () {
    return {
      loading: false,
      form: {
        login: '',
        password: '',
        token: ''
      },
      tfaFlag: false
    }
  },

  validations: {
    form: {
      login: {
        required
      },
      password: {
        required
      },
      token: {}
    }
  },

  computed: {
    ...mapGetters({
      loggedIn: 'auth/loggedIn'
    })
  },

  methods: {
    ...mapActions({
      login: 'auth/login'
    }),

    async loginRequest () {
      this.$v.$touch()

      if (this.$v.$invalid) {
        izitoast.error({
          title: 'Error',
          message: 'All input fields error must be resolved!'
        })

        return false
      }

      this.loading = true

      // register logic here
      try {
        const res = await this.login(this.form)

        if (res.status === 206) {
          this.tfaFlag = true
        } else {
          // Redirect to app
          this.$router.push({ name: 'dashboard' })
        }
      } catch (err) {
        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      } finally {
        this.loading = false
      }
    }
  },

  created () {
    if (this.loggedIn) {
      // Redirect to app
      this.$router.replace({ name: 'dashboard' })
    }
  }
}
</script>
