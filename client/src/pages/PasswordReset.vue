<template>
  <section class="flex justify-center items-center flex-col py-20 px-6 sm:px-0 bg-gray-100 min-h-screen">
    <h1 class="text-3xl text-gray-900">Password reset</h1>
    <div class="w-full max-w-sm">
      <form @submit.prevent="submit()" class="bg-white shadow-lg p-6 rounded-lg mt-10">
        <div>
          <label for="password" class="text-gray-900">Password</label>
          <input type="password" v-model.trim="$v.form.password.$model" class="mt-3 w-full rounded-lg py-3 px-6 border-2 border-gray-200 text-gray-600" id="password">
          <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.required">Password is required</p>
          <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.minLength">Password must have at least {{$v.form.password.$params.minLength.min}} letters.</p>
        </div>
        <div class="mt-6">
          <label for="confirm-password" class="text-gray-900">Confirm password</label>
          <input type="password" v-model="$v.form.confirmPassword.$model" class="mt-3 w-full rounded-lg py-3 px-6 border-2 border-gray-200 text-gray-600" id="confirm-password">
          <p class="text-red-500 text-xs italic" v-if="$v.form.confirmPassword.$error && !$v.form.confirmPassword.sameAsPassword">Passwords must be identical.</p>
        </div>
        <div class="mt-6">
          <button type="submit" class="mt-3 w-full shadow rounded-lg py-3 px-6 bg-green-500 hover:bg-green-400">Change password</button>
        </div>
      </form>
      <div class="mt-6 flex justify-between items-center">
        <router-link to="/login" class="text-gray-900 underline">Login</router-link>
        <router-link to="/register" class="text-gray-900 underline">Register new account</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import izitoast from 'izitoast'
import axios from 'axios'
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
export default {
  name: 'reset_password',
  data () {
    return {
      form: {
        password: '',
        confirmPassword: ''
      }
    }
  },

  validations: {
    form: {
      password: {
        required,
        minLength: minLength(8)
      },
      confirmPassword: {
        sameAsPassword: sameAs('password')
      }
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

    async submit () {
      this.$v.$touch()

      if (this.$v.$invalid) {
        izitoast.error({
          title: 'Error',
          message: 'All input fields error must be resolved!'
        })

        return false
      }

      try {
        const data = { ...this.form, ...this.$route.query}
        
        await axios.post('/password/reset', data)

        izitoast.success({
          title: 'Success',
          message: 'Your password has been changed!'
        })
        // Redirect to app
        this.$router.push({ name: 'login' })
      } catch (err) {
        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }

        izitoast.error({
          title: 'Error',
          message: 'An Unknown error occured.'
        })
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
