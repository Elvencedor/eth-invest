<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Edit User</h1>
        <p class="text-gray-600 leading-tight">Edit user data</p>
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <form @submit.prevent="submit" class="p-4 flex flex-wrap">
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="fullname">Full name</label>
            <input type="text" v-model="$v.user.fullName.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="fullname">
            <p class="text-xs text-red-500 italic" v-if="$v.user.fullName.$error && !$v.user.fullName.required">Name is required</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="email">E-mail</label>
            <input type="text" v-model="$v.user.email.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="email">
            <p class="text-xs text-red-500 italic" v-if="$v.user.email.$error && !$v.user.email.required">Email is required</p>
            <p class="text-xs text-red-500 italic" v-if="$v.user.email.$error && !$v.user.email.email">Invalid email address.</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="bitcoin-address">Bitcoin Address</label>
            <input type="text" v-model="$v.user.btcAddress.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="bitcoin-address">
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="balance">Balance</label>
            <input type="text" v-model="$v.user.balance.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="balance">
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="bonus-balance">Bonus balance</label>
            <input type="text" v-model="$v.user.bonusBalance.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="bonus-balance">
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="status">Status</label>
            <select id="status" v-model="$v.user.status.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black">
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
            <select id="role" v-model="$v.user.role.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black">
              <option value="" disabled selected>[Select role]</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="tfa">2-Factor Authentication</label>
            <select id="tfa" v-model="$v.user.tfaEnabled.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black">
              <option value="" selected disabled>[Select option]</option>
              <option :value="false">Disable</option>
            </select>
          </div>
        </div>
        <div class="w-full">
          <div class="p-3">
            <button type="submit" class="mt-3 rounded-lg py-3 px-6 bg-indigo-500 hover:bg-indigo-400 text-white">Update</button>
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
import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'userEdit',
  mixins: [mixins],


  data () {
    return {
      BigNumber,
      user: {}
    }
  },

  validations: {
    user: {
      fullName: {
        required
      },
      email: {
        required,
        email
      },
      btcAddress: {},
      balance: {},
      bonusBalance: {},
      status: {},
      role: {},
      tfaEnabled: {}
    }
  },

  methods: {
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
        await axios.put(`/admin/users/${this.user.id}`, this.user)

        izitoast.success({
          title: 'Success',
          message: 'User data updated successfull'
        })
      } catch (err) {
        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      }
    }
  },

  async created () {
    try {
      const res = await axios.get(`/admin/users/${this.$route.params.id}`)
      this.user = res.data.data
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
</script>

