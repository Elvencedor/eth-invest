<template>  
  <div class="flex-1">
    <div class="py-6 px-4">
      <div class="mb-6">
        <h1 class="text-xl text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600 leading-tight">Portfolio and statistical data.</p>
      </div>
      <div class="overflow-x-auto flex flex-wrap">
        <div class="w-full sm:w-1/4">
          <div class="bg-blue-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
            <div class="text-white tracking-wide text-sm text-right mb-1">Users</div>
            <div class="text-white text-2xl text-right">{{ stats.userCount || 0 }}</div>
          </div>
        </div>
        <div class="w-full sm:w-1/4">
          <div class="bg-purple-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
            <div class="text-white tracking-wide text-sm text-right mb-1">Deposits</div>
            <div class="text-white text-2xl text-right">{{ stats.depositCount || 0 }}</div>
          </div>
        </div>
        <div class="w-full sm:w-1/4">
          <div class="bg-green-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
            <div class="text-white tracking-wide text-sm text-right mb-1">Withdrawals</div>
            <div class="text-white text-2xl text-right">{{ stats.withdrawalCount || 0 }}</div>
          </div>
        </div>
        <div class="w-full sm:w-1/4">
          <div class="bg-red-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
            <div class="text-white tracking-wide text-sm text-right mb-1">Investments</div>
            <div class="text-white text-2xl text-right">{{ stats.investmentCount || 0 }}</div>
          </div>
        </div>
        <div class="w-full sm:w-1/4">
          <div class="bg-indigo-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
            <div class="text-white tracking-wide text-sm text-right mb-1">Plans</div>
            <div class="text-white text-2xl text-right">{{ stats.planCount || 0 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import izitoast from 'izitoast'
  import { mapGetters } from 'vuex'
  import BigNumber from 'bignumber.js'

  export default {
    data () {
      return {
        stats: {},
        BigNumber: BigNumber
      }
    },

    computed: {
      ...mapGetters({
        user: 'auth/user'
      })
    },

    async created () {
      try {
        const res = await axios.get('/admin/stats')
        this.stats = res.data.data
      } catch (error) {
        izitoast.error({
          title: 'Error',
          message: 'An error occured!'
        })
      }
    }
 }
 
</script>
