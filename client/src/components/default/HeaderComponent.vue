<template>
  <header class="py-4 md:flex justify-between items-center border-b-2 border-gray-800 px-6">
    <div class="flex justify-between items-center">
      <router-link to="/"><img src="../../assets/logo.png" class="h-10" /></router-link>
      <button @click="toggle" type="button" class="focus:outline-none focus:text-white text-gray-500 hover:text-white md:hidden">
        <svg class="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path v-if="!isOpen" fill-rule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
          <path v-else fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"/>
        </svg>
      </button>
    </div>
    <nav class="py-4 md:block md:py-0 border-b-2 md:border-none border-gray-800" :class="isOpen ? 'block': 'hidden'">
      <router-link to="/" class="block md:inline-block py-2 md:py-0 md:mx-4 text-white">Home</router-link>
      <a href="/#about" class="block md:inline-block py-2 md:py-0 md:mx-4 text-white">About</a>
      <a href="/#features" class="block md:inline-block py-2 md:py-0 md:mx-4 text-white">Features</a>
      <a href="/#FAQ" class="block md:inline-block py-2 md:py-0 md:mx-4 text-white">FAQ</a>
      <a href="/#projections" class="block md:inline-block py-2 md:py-0 md:mx-4 text-white">Plans</a>
      <a href="/support" class="block md:inline-block py-2 md:py-0 md:mx-4 text-white">Support</a>
    </nav>
    <div class="py-4 md:py-0 justify-between items-center" :class="isOpen ? 'flex': 'hidden md:flex'">
      <div>
        <router-link to="/register" class="md:mr-4 inline-block text-white border-b-2 border-red-500">Register</router-link>
      </div>
      <div>
        <router-link to="/login" class="md:ml-4 mt-4 md:mt-0 inline-block  px-3 py-2 rounded-lg bg-red-500 text-black">Login</router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  data () {
    return {
      isOpen: false
    }
  },
  methods: {
    toggle () {
      this.isOpen = !this.isOpen
    }
  },

  mounted () {
    // Close dropdown when a link is click on the menu
    document.querySelectorAll('a').forEach((item) => {
      item.addEventListener('click', () => {
        if (this.isOpen) this.isOpen = false
      })
    })
  }
}
</script>