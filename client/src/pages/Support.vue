<template>
  <section class="flex justify-center items-center flex-col pt-2 mt-20 px-6 sm:px-10 md:px-20 lg:px-40">
    <h1 class="text-3xl font-bold text-white">Support</h1>
    <div class="w-full max-w-xl text-center mt-10">
      <div class="flex flex-wrap">
        <div class="w-1/3">
          <a href="http://t.me/CrespoCSO" class="block border-2 border-green-500 rounded m-4 p-4 text-green-500 text-center text-sm hover:bg-green-500 hover:text-gray-900" title="Telegram">
            <i class="fab fa-telegram fa-2x"></i>
            <div class="mt-2">Telegram</div>
          </a>
        </div>
        <div class="w-1/3">
          <a href="https://twitter.com/clubcrespo/" class="block border-2 border-green-500 rounded m-4 p-4 text-green-500 text-center text-sm hover:bg-green-500 hover:text-gray-900" title="Twitter">
            <i class="fab fa-twitter fa-2x"></i>
            <div class="mt-2">Twitter</div>
          </a>
        </div>
        <div class="w-1/3">
          <a href="mailto:cresposachi@gmail.com" class="block border-2 border-green-500 rounded m-4 p-4 text-green-500 text-center text-sm hover:bg-green-500 hover:text-gray-900" title="Mail">
            <i class="fas fa-at fa-2x"></i>
            <div class="mt-2">Mail</div>
          </a>
        </div>
      </div>
    </div>
    <div class="w-full max-w-xl">
      <form @submit.prevent="submit" class="border-2 py-6 rounded-lg mt-10">
        <div class="flex flex-wrap">
          <div class="w-full sm:w-1/2 px-6">
            <label
              for="name"
              class="text-gray-900"
            >
              Your Name
            </label>
            <input 
              type="text" 
              v-model="$v.form.name.$model" 
              class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" 
              id="name" 
              placeholder=""
            >
            <p 
              class="text-xs text-green-500 italic" 
              v-if="$v.form.name.$error && !$v.form.name.required"
            >
              Name is required
            </p>
          </div>
          <div class="w-full sm:w-1/2 px-6 mt-6 sm:mt-0">
            <label 
              for="email" 
              class="text-gray-900"
            >
              Your E-mail
            </label>
            <input 
              type="email" 
              v-model="$v.form.email.$model" 
              class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" 
              id="email" 
              placeholder=""
            >
            <p 
              class="text-xs text-green-500 italic" 
              v-if="$v.form.email.$error && !$v.form.email.required"
            >
              E-mail is required
            </p>
          </div>
        </div>
        <div class="mt-6">
          <div class="px-6">
            <label 
              for="topic" 
              class="text-gray-900"
            >
              What can we do for you?
            </label>
            <select
              id="topic"
              v-model="$v.form.topic.$model" 
              class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" 
            >
              <option value="" selected disabled>Choose topic</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="investment">Investment</option>
              <option value="2fa">Two-factor authentication</option>
              <option value="other">Other (describe below)</option>
            </select>
            <p 
              class="text-xs text-green-500 italic" 
              v-if="$v.form.topic.$error && !$v.form.topic.required"
            >
              Topic is required
            </p>
          </div>
        </div>
        <div v-if="form.topic === 'other'" class="mt-6">
          <div class="px-6">
            <label 
              for="customTopic" 
              class="text-gray-900"
            >
              Specify topic
            </label>
            
             <input 
              type="text" 
              v-model="$v.form.customTopic.$model" 
              class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" 
              id="customTopic" 
              placeholder="Specify nature of discussion"
            >
            <p 
              class="text-xs text-green-500 italic" 
              v-if="$v.form.customTopic.$error && !$v.form.customTopic.required"
            >
              Topic is required
            </p>
          </div>
        </div>
        <div class="mt-6">
          <div class="px-6">
            <label 
              for="description"
              class="text-gray-900"
            >
              What is your question, comment or issue?
            </label>
            <textarea 
              v-model="$v.form.description.$model" 
              class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-gray-600" 
              id="description" 
              rows="6" 
              placeholder=""
            >
            </textarea>
            <p 
              class="text-green-500 text-xs italic" 
              v-if="$v.form.description.$error && !$v.form.description.required"
            >
              Description is required
            </p>
          </div>
        </div>
        <div class="mt-6">
          <div class="px-6">
            <button
              type="submit"
              class="mt-3 w-full shadow rounded-lg py-3 px-6 bg-green-500 hover:bg-green-400 disabled:opacity-50"
              :disabled="loading"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'Support',
  data () {
    return {
      loading: false,
      form: {
        name: '',
        email: '',
        topic: '',
        customTopic: '',
        description: ''
      }
    }
  },

  validations: {
    form: {
      name: {
        required
      },
      email: {
        required,
        email
      },
      topic: {
        required
      },
      description: {
        required
      },
      customTopic: {}
    }
  },

  methods: {
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
        await axios.post('/support', this.form)

        this.form.name = 
        this.form.email = 
        this.form.topic = 
        this.form.customTopic = 
        this.form.description = ''

        this.$v.$reset()

        izitoast.success({
          title: 'Success',
          message: 'Support successfully sent'
        })
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
  }
}
</script>