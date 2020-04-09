<template>
  <section class="flex justify-center items-center flex-col py-20 px-6 sm:px-0">
    <h1 class="text-3xl text-white">Login</h1>
    <div class="w-full max-w-sm">
      <form @submit.prevent="loginRequest()" class="bg-gray-800 p-6 rounded-lg mt-10">
        <div>
          <label for="login" class="text-white">Login</label>
          <input type="text" v-model="$v.form.login.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-900 text-white" id="login" placeholder="E-mail or username">
          <p class="text-xs text-red-500 italic" v-if="$v.form.login.$error && !$v.form.login.required">Login is required</p>
        </div>
        <div class="mt-6">
          <div class="flex justify-between items-center">
            <label for="password" class="text-white">Password</label>
            <router-link to="/forgot_password" class="text-white underline text-sm">Forgot password?</router-link>
          </div>
          <input type="password" v-model="$v.form.password.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-900 text-white" id="password" placeholder="**********">
          <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.required">Password is required</p>
        </div>
        <div v-if="tfaFlag" class="mt-6">
          <label for="token" class="text-white">Token (OTP)</label>
          <input type="text" v-model.trim="$v.form.token.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-900 text-white" id="token">
          <p class="text-red-500 text-xs italic" v-if="$v.form.token.$error && !$v.form.token.required">Token is required</p>
        </div>
        <div class="mt-6">
          <button
            type="submit"
            class="mt-3 w-full shadow rounded-lg py-3 px-6 bg-red-500 hover:bg-red-400 disabled:opacity-50"
            :disabled="loading"
          >
            Login
          </button>
        </div>
      </form>
      <p class="mt-10 text-center text-sm px-6 text-white">
        Didn't receive our activation/welcome email? <br >
        <router-link to="/resend_confirmation" class="text-white underline">Resend here</router-link>.
      </p>
      <div class="mt-6">
        <router-link
          to="/register"
          class="block text-center text-red-500 shadow rounded-lg py-3 px-6 border-2 border-red-500 hover:bg-red-500 hover:text-black"
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
