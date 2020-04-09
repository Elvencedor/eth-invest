
<template>
  <div class="flex-1">
    <div class="py-6 mx-4">
      <h1 class="text-xl text-gray-900 mb-2">Account Settings</h1>
      <p class="text-gray-600 leading-tight">Manage your profile and security preferences.</p>
    </div>
    <div class="border-t-2 py-6 mx-4">
      <div class="sm:flex">
        <div class="sm:pr-6 sm:w-2/5">
          <h3 class="text-xl">Profile</h3>
          <p class="mt-3 text-gray-600">Update your name, e-mail and Bitcoin wallet address.</p>
        </div>
        <div class="mt-6 sm:w-3/5 sm:mt-0">
        <div class="bg-white p-4 shadow-md rounded">
          <form @submit.prevent="updateProfile">
            <div>
              <label for="email" class="block uppercase text-sm text-gray-900 tracking-wide">E-Mail</label>
              <input
                v-model="user.email"
                type="text"
                id="email"
                class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
              >
            </div>
            <div class="mt-6">
              <label for="username" class="block uppercase text-sm text-gray-900 tracking-wide">Username</label>
              <input
                v-model="user.username"
                type="text"
                id="username"
                class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
                readonly
              >
            </div>
            <div class="mt-6">
              <label for="full-name" class="block uppercase text-sm text-gray-900 tracking-wide">Full Name</label>
              <input
                v-model="user.fullName"
                type="text"
                id="full-name"
                class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
              >
            </div>
            <div class="mt-6">
              <label for="btcAddress" class="block uppercase text-sm text-gray-900 tracking-wide">Bitcoin Wallet Address</label>
              <input
                v-model="user.btcAddress"
                type="text"
                id="btcAddress"
                class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
              >
            </div>
            <div class="mt-6">
              <input
                type="submit"
                value="Save changes"
                class="uppercase bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer p-3 text-sm rounded disabled:opacity-75"
              >
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
    <div class="border-t-2 py-6 mx-4">
      <div class="sm:flex">
        <div class="sm:pr-6 sm:w-2/5">
          <h3 class="text-xl">Password</h3>
          <p class="mt-3 text-gray-600">Change your password.</p>
        </div>
        <div class="mt-6 sm:w-3/5 sm:mt-0">
          <div class="bg-white p-4 shadow-md rounded">
            <form @submit.prevent="updatePassword">
              <div>
                <label for="old-password" class="block uppercase text-sm text-gray-900 tracking-wide">Current Password</label>
                <input
                  v-model="password.currentPassword"
                  type="password"
                  id="old-password"
                  class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
                  placeholder="********"
                >
              </div>
              <div class="mt-6">
                <label for="new-password" class="block uppercase text-sm text-gray-900 tracking-wide">New Password</label>
                <input
                  v-model="password.newPassword"
                  type="password"
                  id="new-password"
                  class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
                >
              </div>
              <div class="mt-6">
                <label for="confirm-new-password" class="block uppercase text-sm text-gray-900 tracking-wide">Confirm New Password</label>
                <input
                  v-model="password.confirmPassword"
                  type="password"
                  id="confirm-new-password"
                  class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
                >
              </div>
              <div class="mt-6">
                <input
                  type="submit"
                  value="Save changes"
                  class="uppercase bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer p-3 text-sm rounded disabled:opacity-75"
                >
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t-2 py-6 mx-4">
      <div class="sm:flex">
        <div class="sm:pr-6 sm:w-2/5">
          <h3 class="text-xl">Security</h3>
          <p class="mt-3 text-gray-600">Additional security settings for your account.</p>
        </div>
        <div class="mt-6 sm:w-3/5 sm:mt-0">
          <div class="bg-white p-4 shadow-md rounded">
            <div>
              <div>
                <h3 class="uppercase text-sm text-gray-900 tracking-wide">Two-factor authenication</h3>
              </div>
              <div class="mt-6">
                <p v-if="user.tfaEnabled" class="py-4 px-4 bg-green-200 rounded text-green-800 border-l-2 border-green-900 justify-between flex flex-wrap items-center">
                  <span>
                    <i class="fa fa-check text-green-500 mr-2"></i> Two-Factor Authentication enabled.
                  </span>
                  <button v-if="!enabling" @click="disable2fa($event)" type="button" class="uppercase bg-red-500 hover:bg-red-400 text-white cursor-pointer px-3 py-2 text-sm rounded disabled:opacity-75">Disable</button>
                </p>
                <form @submit.prevent="verify2fa" v-else>
                  <div class="flex justify-between items-center">
                    <div>Enable Two-Factor Authentication</div>
                    <button v-if="!enabling" @click="setup2fa($event)" type="button" class="uppercase bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer px-3 py-2 text-sm rounded disabled:opacity-75">Enable</button>
                  </div>
                  <div v-if="enabling" class="mt-6 sm:flex border-t py-6">
                    <div>
                      <img :src="tfaDetails.dataURL" class="border" alt="2-FA barcode">
                      <div class="mt-4 uppercase sm:text-center"> {{ tfaDetails.tempSecret }} </div>
                    </div>
                    <div class="mt-6 sm:ml-6">
                      <div>
                        <label for="old-password" class="block text-sm text-gray-900 tracking-wide">Verify your code</label>
                        <input
                          v-model="token"
                          type="text"
                          id="old-password"
                          class="mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
                          placeholder="******"
                        >
                      </div>
                      <div class="mt-6">
                        <input
                          type="submit"
                          value="Enable 2FA"
                          class="uppercase bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer p-3 text-sm rounded disabled:opacity-75"
                        >
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import izitoast from 'izitoast'
  import { mapGetters, mapActions } from 'vuex'

  export default {
    data () {
      return {
        enabling: false,
        token: '',
        password: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        },
        tfa: false,
        tfaDetails: {}
      }
    },

    computed: {
      ...mapGetters({
        user: 'auth/user'
      })
    },

    methods: {
      ...mapActions({
        fetchSelf: 'auth/self'
      }),

      async updateProfile () {
        try {
          const res = await axios.put('/users', this.user)

          if (res.data.data.email !== this.user.email) {
            return izitoast.success({
              title: 'Success',
              message: 'Check your mailbox for further e-mail update instructions.'
            })
          }

          izitoast.success({
            title: 'Success',
            message: 'Profile successfully updated.'
          })
        } catch (err) {
          if (err.response.status >= 400) {
            return izitoast.error({
              title: 'Error',
              message: err.response.data.errors[0].title
            })
          }
        }
      },

      async updatePassword () {
        if (this.password.newPassword !== this.password.confirmPassword) {
          return izitoast.error({
            title: 'Error',
            message: 'Confirm password does not match'
          })
        }

        try {
          await axios.put('/users/updatePassword', this.password)

          izitoast.success({
            title: 'Success',
            message: 'Password successfully updated.'
          })
        } catch (err) {
          if (err.response.status === 400) {
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
      },

      async setup2fa () {   
        this.enabling = true 
        this.tfaDetails = {}

        try {
          const res = await axios.get('/tfa')
          this.tfaDetails = res.data.data
        } catch (err) {
          if (err.response.status === 400) {
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
      },

      async disable2fa () {   
        this.enabling = false
        this.tfaDetails = {}

        try {
          await axios.delete('/tfa')
          this.user.tfaEnabled = false

          izitoast.success({
            title: 'Success',
            message: '2FA successfully disabled!'
          })
        } catch (err) {
          if (err.response.status === 400) {
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
      },

      async verify2fa () {
        try {
            await axios.post('/tfa', { token: this.token })
            this.user.tfaEnabled = true
            this.enabling = false

            izitoast.success({
              title: 'Success',
              message: '2FA successfully enabled!'
            })
          } catch (err) {
            if (err.response && err.response.status === 400) {
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
        await this.fetchSelf()
      } catch (err) {
        izitoast.error({
          title: 'Error',
          message: 'An error occured!'
        })
      }
    }
  }
</script>