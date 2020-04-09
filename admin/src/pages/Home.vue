<template>
  <h1></h1>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import axios from 'axios'

export default {
  computed: {
    ...mapGetters({
      loggedIn: 'auth/loggedIn'
    })
  },

  methods: {
     ...mapMutations({
      setAuth: 'auth/setAuth',
      setUser: 'auth/setUser'
    })
  },

  async created () {
    try {
      const res = await axios.get('/users/self')
      this.setAuth()
      this.setUser(res.data.data)

      if (this.loggedIn) {
        // Redirect to app
        this.$router.replace({ name: 'dashboard' })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
</script>