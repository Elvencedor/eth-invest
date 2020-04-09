<template>
  <section class="mx-auto">
    <HeaderComponent />
    <main class="min-h-screen">
      <router-view></router-view>
    </main>
    <FooterComponent />
  </section>
</template>

<script>
import HeaderComponent from '../components/default/HeaderComponent'
import FooterComponent from '../components/default/FooterComponent'

export default {
  name: 'defaultLayout',
  components: {
    HeaderComponent,
    FooterComponent
  },
  data () {
    return {
      selectedQuestion: null
    }
  },
  methods:{
    range : function (start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
    },

    selectQuestion (index) {
      if (this.selectedQuestion !== index) {
        this.selectedQuestion = index
      } else {
        this.selectedQuestion = null
      }
    }
  }
}
</script>