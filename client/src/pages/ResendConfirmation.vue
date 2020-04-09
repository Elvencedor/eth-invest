<template>
  <section class="flex justify-center items-center flex-col py-20 px-6 sm:px-0">
    <h1 class="text-3xl text-white">Resend Activation Mail</h1>
    <div class="w-full max-w-sm">
      <form @submit.prevent="submit()" class="bg-gray-800 p-6 rounded-lg mt-10">
        <div>
          <label for="email" class="text-white">E-mail</label>
          <input type="text" v-model.trim="$v.form.email.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-900 text-white" id="email">
          <p class="text-xs text-red-500 italic" v-if="$v.form.email.$error && !$v.form.email.required">Email is required</p>
          <p class="text-xs text-red-500 italic" v-if="$v.form.email.$error && !$v.form.email.email">Invalid email address.</p>
        </div>
        <div class="mt-6">
          <button
            type="submit"
            class="mt-3 w-full shadow rounded-lg py-3 px-6 bg-red-500 hover:bg-red-400 disabled:opacity-50"
            :disabled="loading"
          >
            Resend
          </button>
        </div>
      </form>
      <div class="mt-6 flex justify-between items-center">
        <router-link to="/login" class="text-white underline">Back to login</router-link>
        <router-link to="/register" class="text-white underline">Register new account</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import izitoast from 'izitoast'
import axios from 'axios'
import { required, email } from 'vuelidate/lib/validators'
export default {
  name: 'forgotPassword',
  data () {
    return {
      loading: false,
      form: {
        email: '',
      }
    }
  },

  validations: {
    form: {
      email: {
        required,
        email
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

      this.loading = true
  
      try {
        await axios.post('/confirmation/send', this.form)

        izitoast.success({
          title: 'Success',
          message: 'Account activation instructions have been sent to your e-mail!'
        })

        this.$router.push('/login')
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

  created () {
    if (this.loggedIn) {
      // Redirect to app
      this.$router.replace({ name: 'dashboard' })
    }
  }
}
</script>
