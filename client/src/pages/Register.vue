<template>
  <section class="flex justify-center items-center flex-col py-20 px-6 sm:px-0">
    <h1 class="text-3xl text-gray-900">Register</h1>
    <div class="w-full max-w-lg">
      <form @submit.prevent="registerRequest()" class="border-2 p-6 rounded-lg mt-10">
        <div>
          <label for="fullname" class="text-gray-900">Full name</label>
          <input type="text" v-model="$v.form.fullName.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" id="fullname">
          <p class="text-xs text-red-500 italic" v-if="$v.form.fullName.$error && !$v.form.fullName.required">Name is required!</p>
        </div>
        <div class="mt-6">
          <label for="email" class="text-gray-900">E-mail</label>
          <input @input="suggestUsername" type="text" v-model.trim="$v.form.email.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" id="email">
          <p class="text-xs text-red-500 italic" v-if="$v.form.email.$error && !$v.form.email.required">Email is required!</p>
          <p class="text-xs text-red-500 italic" v-if="$v.form.email.$error && !$v.form.email.email">Invalid email address!</p>
        </div>
        <div class="mt-6">
          <label for="username" class="text-gray-900">Username</label>
          <input @input="$v.form.username.$model = String($v.form.username.$model).toLowerCase()" type="text" v-model.trim="$v.form.username.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" id="username">
          <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.required">Username is required!</p>
          <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.minLength">Username is too short! Min: 3 chars</p>
          <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.maxLength">Username is too long! Max: 32 chars</p>
          <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.usernameValidator">Invalid username!</p>
        </div>
        <div class="mt-6">
          <label for="password" class="text-gray-900">Password</label>
          <input type="password" v-model="$v.form.password.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" id="password">
          <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.required">Password is required</p>
          <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.minLength">Password must have at least {{$v.form.password.$params.minLength.min}} letters.</p>
        </div>
        <div class="mt-6">
          <label for="confirm-password" class="text-gray-900">Confirm password</label>
          <input type="password" v-model="$v.form.confirmPassword.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" id="confirm-password">
          <p class="text-red-500 text-xs italic" v-if="$v.form.confirmPassword.$error && !$v.form.confirmPassword.sameAsPassword">Passwords must be identical.</p>
        </div>
        <div v-if="form.referrer" class="mt-6">
          <label for="referrer" class="text-gray-900">Referrer</label>
          <input type="text" readonly v-model="$v.form.referrer.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" id="referrer">
          <p class="text-red-500 text-xs italic" v-if="$v.form.referrer.$error && !$v.form.referrer.required">Referrer is required</p>
        </div>
        <div class="mt-6 flex items-center">
          <input type="checkbox" v-model="form.tac" class="rounded-lg py-3 px-6 bg-gray-900">
          <p class="text-gray-900 ml-4">I agree with <router-link to="/terms" class="text-green-500">Terms and Conditions</router-link></p>
        </div>
        <div class="mt-6">
          <button
            type="submit"
            class="mt-3 w-full shadow rounded-lg py-3 px-6 bg-green-500 text-gray-900 hover:bg-green-400 disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading" class="fas fa-spinner fa-spin"> </span>
            Register 
          </button>
        </div>
      </form>
      <div class="mt-20">
        <router-link
          to="/login"
          class="block text-center text-green-500 shadow rounded-lg py-3 px-6 border-2 border-green-500 hover:bg-green-500 hover:text-gray-900"
        >
          I already have an account
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import izitoast from 'izitoast'
import axios from 'axios'
import { required, minLength, maxLength, email, sameAs } from 'vuelidate/lib/validators'

const usernameValidator = value => {
  if (typeof value === 'undefined' || value === null || value === '') {
    return true
  }
  return /^(?=[_\da-zA-Z]*$)(?!_*$)(?=(.*[a-zA-Z]){2})/.test(value)
}

export default {
  name: 'register',
  data () {
    return {
      loading: false,
      form: {
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        referrer: null,
        tac: false
      }
    }
  },
  
  validations: {
    form: {
      fullName: {
        required
      },
      email: {
        required,
        email
      },
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(32),
        usernameValidator
      },
      password: {
        required,
        minLength: minLength(8)
      },
      confirmPassword: {
        sameAsPassword: sameAs('password')
      },
      referrer: {},
      tac: {
        required
      }
    }
  },

  computed: {
    ...mapGetters({
      loggedIn: 'auth/loggedIn'
    }),
    console: () => console
  },

  methods: {
    ...mapActions({
      login: 'auth/login',
      register: 'auth/register'
    }),

    suggestUsername () {
      const namePart = String(this.form.email.split('@')[0]).toLowerCase()

      if (!this.form.username || namePart.includes(this.form.username))
      this.form.username = String(namePart).toLowerCase()
    },

    async registerRequest () {
      this.$v.$touch()
      
      if (this.$v.$invalid) {
        return izitoast.error({
          title: 'Error',
          message: 'All input fields errors must be resolved!'
        })
      }

      if (!this.form.tac) {
        return izitoast.error({
          title: 'Error',
          message: 'Please read and accept our terms and conditions first!'
        })
      }

      this.loading = true

      // register logic here
      try {
        // Registration request
        await this.register(this.form)

        izitoast.success({
          title: 'Success',
          message: 'Registration successfull'
        })

        // Redirect to login
        this.$router.push({ name: 'login' })
      } catch (err) {
        if (err.response && err.response.status >= 400) {
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

  async created () {
    if (this.loggedIn) {
      // Redirect to app
      this.$router.replace({ name: 'dashboard' })
    }

    if (this.$route.query.ref) {
      const referrer = sessionStorage.getItem('referrer')

      if (referrer !== null) {
        this.form.referrer = referrer
      } else {
        const res = await axios.get(`/user/${this.$route.query.ref}`)

        if (res) {
          const referrer = res.data.data.username
          this.form.referrer = referrer

          sessionStorage.setItem('referrer', referrer)
        }
      }
    }
  }
}
</script>
