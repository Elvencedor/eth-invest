<template>
  <section class="mx-auto">
    <HeaderComponent />
    <section class="min-h-screen block bg-gray-200">
      <main class="container mx-auto">
        <router-view></router-view>
      </main>
    </section>
    <FooterComponent />
  </section>
</template>

<script>
import axios from 'axios'
import { mapMutations } from 'vuex'
import HeaderComponent from '../components/main/HeaderComponent'
import FooterComponent from '../components/main/FooterComponent'

export default {
  name: 'mainLayout',
  components: {
    HeaderComponent,
    FooterComponent
  },

  methods: {
    ...mapMutations({
      setAuth: 'auth/setAuth',
      setUser: 'auth/setUser'
    })
  },

  async created () {
    const res = await axios.get('/users/self')
    this.setAuth()
    this.setUser(res.data.data)
  }
}
</script>