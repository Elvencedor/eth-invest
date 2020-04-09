<template>
  <section class="flex justify-center items-center flex-col py-20 px-6 sm:px-0">
    <h1 class="text-3xl text-white">Email Update</h1>
    <div class="w-full max-w-sm mt-4">
     <div v-if="status === 'LOADING'" class="p-4 rounded bg-blue-300 border-2 border-blue-600 shadow-md">
       <h3 class="text-lg text-blue-900">Processing...</h3>
     </div>
     <div v-if="status === 'ERROR'" class="p-4 rounded bg-red-300 border-2 border-red-600 shadow-md">
       <h3 class="text-lg text-red-900">Email update failed!</h3>
     </div>
    </div>
  </section>
</template>

<script>
import izitoast from 'izitoast'
import axios from 'axios'

export default {
  name: 'register',
  data () {
    return {
      status: 'LOADING'
    }
  },

  async created () {
    
    try {
      await axios.put('/users/updateEmail', this.$route.query)

      izitoast.success({
        title: 'Success',
        message: 'Your email has been updated successfully!'
      })

      this.$router.replace({ name: 'login' })
    } catch (err) {
      this.status = 'ERROR'

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
