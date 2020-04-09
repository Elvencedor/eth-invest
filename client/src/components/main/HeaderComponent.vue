<template>  
  <header class="bg-gray-900">
    <div class="container mx-auto">
      <div class="w-full sm:flex sm:items-center sm:justify-between">
        <div class="py-4 px-4 flex justify-between items-center">
          <router-link to="/dashboard"><img src="../../assets/logo.png" class="h-10" /></router-link>
          <button @click="toggle" type="button" class="focus:outline-none focus:text-white text-gray-500 hover:text-white sm:hidden">
            <svg class="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path v-if="!isOpen" fill-rule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
              <path v-else fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"/>
            </svg>
          </button>
        </div>
        <nav class="sm:flex sm:items-center" :class="!isOpen ? 'hidden': 'block'">
          <div class="pb-4 sm:flex sm:pb-0">
            <router-link to="/dashboard" class="block font-semibold py-3 px-4 text-white rounded hover:bg-gray-800 sm:py-2 sm:text-sm sm:px-3">Dashboard</router-link>
            <router-link to="/deposits" class="block font-semibold py-3 px-4 text-white rounded hover:bg-gray-800 sm:py-2 sm:text-sm sm:px-3">Deposits</router-link>
            <router-link to="/withdrawals" class="block font-semibold py-3 px-4 text-white rounded hover:bg-gray-800 sm:py-2 sm:text-sm sm:px-3">Withdrawals</router-link>
            <router-link to="/investments" class="block font-semibold py-3 px-4 text-white rounded hover:bg-gray-800 sm:py-2 sm:text-sm sm:px-3">Investments</router-link>
            <router-link to="/referrals" class="block font-semibold py-3 px-4 text-white rounded hover:bg-gray-800 sm:py-2 sm:text-sm sm:px-3">Referrals</router-link>
          </div>
          <div class="relative py-5 px-4 border-t border-gray-800 sm:border-t-0 sm:py-0">
            <div class="hidden items-center sm:flex">
              <!-- <button type="button" class="h-6 w-6 rounded-full hover:bg-indigo-500 text-white focus:outline-none focus:bg-indigo-500 bg-gray-700 p-1 mr-6">
                <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="19" r="3"/><path d="M10.02 4.28L10 4a2 2 0 1 1 3.98.28A7 7 0 0 1 19 11v5a1 1 0 0 0 1 1 1 1 0 0 1 0 2H4a1 1 0 0 1 0-2 1 1 0 0 0 1-1v-5a7 7 0 0 1 5.02-6.72z"/></svg>
              </button> -->
              <button @click="toggleDropdown" type="button" class="h-10 w-10 p-2 rounded-full border-2 border-gray-400 text-white hover:border-white focus:outline-none focus:border-white">
                <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/><path d="M21 20v-1a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2z"/></svg>
                <!-- {@html genUniqueAvatar(auth.user().email) } -->
              </button>
            </div>
            <div :class="dropdownOpen ? 'sm:block' : 'sm:hidden'">
              <button @click="toggleDropdown" type="button" class="hidden sm:block sm:fixed sm:opacity-0 sm:inset-0 sm:w-full sm:h-full sm:cursor-default"></button>
              <div class="z-50 sm:mt-3 sm:absolute sm:bg-white sm:rounded sm:right-0 sm:shadow-xl sm:w-48 sm:py-2">
                <router-link to="/settings" class="py-3 block text-gray-400 hover:text-white sm:text-sm sm:text-gray-800 sm:px-4 sm:py-2 sm:hover:bg-indigo-500">Settings</router-link>
                <router-link to="/support" class="py-3 block text-gray-400 hover:text-white sm:text-sm sm:text-gray-800 sm:px-4 sm:py-2 sm:hover:bg-indigo-500">Support</router-link>
                <a @click.prevent="logout()" href="#" class="py-3 block text-gray-400 hover:text-white sm:text-sm sm:text-gray-800 sm:px-4 sm:py-2 sm:hover:bg-indigo-500">
                  Log out
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions } from 'vuex'
import izitoast from 'izitoast'

export default {
  data () {
    return {
      isOpen: false,
      dropdownOpen: false
    }
  },

  methods: {
    ...mapActions({
      logoutRequest: 'auth/logout'
    }),

    toggle () {
      this.isOpen = !this.isOpen
    },

    toggleDropdown () {
      this.dropdownOpen = !this.dropdownOpen
    },

    async logout () {
      this.logoutRequest()
        .then(() => {
          izitoast.success({
            title: 'Success',
            message: 'You have successfully logged out!'
          })

          this.$router.replace({ name: 'login' })
        })
        .catch(() => {
          izitoast.error({
            title: 'Error',
            message: 'An unexpected error occured! Cant log out.'
          })
        })
    }
  },

  mounted () {
    this.onEscape = (e) => {
      if (this.dropdownOpen || e.key === 'Escape') {
        this.dropdownOpen = false
      }
    }

    // Close dropdown when hit on escape
    document.addEventListener('keydown', this.onEscape)

    // Close dropdown when a link is click on the menu
    document.querySelectorAll('a').forEach((item) => {
      item.addEventListener('click', () => {
        if (this.dropdownOpen) this.dropdownOpen = false
        if (this.isOpen) this.isOpen = false
      })
    })
  },

  destroyed () {
    document.removeEventListener('keydown', this.onEscape)
  }
}
</script>