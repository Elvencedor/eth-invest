<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Add User</h1>
        <p class="text-gray-600 leading-tight">Add new user data</p>
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <form @submit.prevent="submit" class="p-4 flex flex-wrap">
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="fullname">Full name</label>
            <input type="text" v-model="$v.form.fullName.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="fullname">
            <p class="text-xs text-red-500 italic" v-if="$v.form.fullName.$error && !$v.form.fullName.required">Name is required</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="email">E-mail</label>
            <input @input="suggestUsername" type="text" v-model="$v.form.email.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="email">
            <p class="text-xs text-red-500 italic" v-if="$v.form.email.$error && !$v.form.email.required">Email is required</p>
            <p class="text-xs text-red-500 italic" v-if="$v.form.email.$error && !$v.form.email.email">Invalid email address.</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="username">Username</label>
            <input @input="$v.form.username.$model = String($v.form.username.$model).toLowerCase()" type="text" v-model.trim="$v.form.username.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="username">
            <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.required">Username is required!</p>
            <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.minLength">Username is too short! Min: 3 chars</p>
            <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.maxLength">Username is too long! Max: 32 chars</p>
            <p class="text-xs text-red-500 italic" v-if="$v.form.username.$error && !$v.form.username.usernameValidator">Invalid username!</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="bitcoin-address">Bitcoin Address</label>
            <input type="text" v-model="$v.form.btcAddress.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="bitcoin-address">
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="balance">Balance</label>
            <input type="text" v-model="$v.form.balance.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="balance">
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="bonus-balance">Bonus balance</label>
            <input type="text" v-model="$v.form.bonusBalance.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="bonus-balance">
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="status">Status</label>
            <select id="status" v-model="$v.form.status.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black">
              <option value="" disabled selected>[Select status]</option>
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="role">Role</label>
            <select id="role" v-model="$v.form.role.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black">
              <option value="" disabled selected>[Select role]</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="password">Password</label>
            <input type="text" v-model="$v.form.password.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="password">
            <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.required">Password is required</p>
            <p class="text-red-500 text-xs italic" v-if="$v.form.password.$error && !$v.form.password.minLength">Password must have at least {{$v.form.password.$params.minLength.min}} letters.</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="confirm-password">Confirm password</label>
            <input type="text" v-model="$v.form.confirmPassword.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="confirm-password">
            <p class="text-red-500 text-xs italic" v-if="$v.form.confirmPassword.$error && !$v.form.confirmPassword.sameAsPassword">Passwords must be identical.</p>
          </div>
        </div>
        <div class="w-full">
          <div class="p-3">
            <button type="submit" class="mt-3 rounded-lg py-3 px-6 bg-indigo-500 hover:bg-indigo-400 text-white">Add</button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import mixins from '@/mixins'
import BigNumber from 'bignumber.js'
import { required, minLength, maxLength, email, sameAs } from 'vuelidate/lib/validators'

const usernameValidator = value => {
  if (typeof value === 'undefined' || value === null || value === '') {
    return true
  }
  return /^(?=[_\da-zA-Z]*$)(?!_*$)(?=(.*[a-zA-Z]){2})/.test(value)
}

export default {
  name: 'userEdit',
  mixins: [mixins],

  data () {
    return {
      BigNumber,
      form: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        btcAddress: '',
        balance: '',
        bonusBalance: '',
        username: '',
        status: '',
        role: ''
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
      btcAddress: {},
      balance: {},
      bonusBalance: {},
      status: {},
      role: {}
    }
  },

  methods: {
    suggestUsername () {
      const namePart = String(this.form.email.split('@')[0]).toLowerCase()

      if (!this.form.username || namePart.includes(this.form.username))
      this.form.username = String(namePart).toLowerCase()
    },

    async submit () {
      this.$v.$touch()
      
      if (this.$v.$invalid) {
        return izitoast.error({
          title: 'Error',
          message: 'All input fields error must be resolved!'
        })
      }

      try {
        // request
        await axios.post('/admin/users', this.form)

        izitoast.success({
          title: 'Success',
          message: 'New user added successfull'
        })

        // Redirect to users
        this.$router.push({ name: 'users' })
      } catch (err) {
        if (!err.response) {
          return izitoast.error({
            title: 'Error',
            message: 'Could not connect to server. Please try later.'
          })
        }

        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      }
    }
  }
}
</script>

