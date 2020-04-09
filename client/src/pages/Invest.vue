<template>
  <section class="px-4 pb-12">
    <div class="py-6">
      <h1 class="text-xl text-gray-900 mb-2">Investment</h1>
      <p class="text-gray-600 leading-tight">Choose a plan to start growing your balance.</p>
    </div>
    <div class="flex flex-wrap -mx-2 justify-center mt-4">
      <div v-for="(plan, i) in plans" :key="i" class="w-full sm:w-1/4">
        <label>
          <input type="radio" v-model="activePlan" :value="plan" class="hidden" />
          <div class="my-2 sm:my-0 p-4 bg-white border-2 rounded shadow-md cursor-pointer mx-2 relative" :class="activePlan.name === plan.name ? 'border-green-500' : ''">
            <span v-if="activePlan.name === plan.name" class="absolute w-8 h-8 bg-green-500 top-0 right-0 rounded-full flex justify-center items-center -mt-2 -mr-2">
              <span class="lnr lnr-checkmark-circle text-white font-semibold"></span>
            </span>
            <div class="text-gray-600 uppercase text-sm tracking-wide">{{ plan.name }} ({{ plan.duration }} days)</div>
            <div class="mt-2 text-3xl text-gray-900">{{ plan.percentage }}%</div>
            <small class="mt-2 block text-gray-900">Minimum: ${{ BigNumber(plan.minimumAmount || 0).toFormat(2) }}</small>
          </div>
        </label>
      </div>
    </div>
    <div class="mt-4 sm:mt-10 flex justify-center items-center">
      <input
        @click="proceed"
        type="button"
        value="Continue"
        class="w-24 uppercase bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer p-3 text-sm rounded disabled:opacity-50"
      >
    </div>
    <Modal v-if="modal" v-on:close="modal = false">
      <div slot="title">Plan: {{ activePlan.name }}</div>
      <div slot="content">
        <div>
          <label for="amount" class="block uppercase text-sm text-gray-900 tracking-wide">Amount (USD)</label>
          <input
            type="test"
            id="amount"
            v-model="form.amount"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            placeholder="0.00"
          >
        </div>
        <div class="mt-6">
          <input
            type="checkbox"
            id="useBonus"
            v-model="form.useBonus"
            class="mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            placeholder="0.00"
          >
          <label for="useBonus" class="ml-3 uppercase text-sm text-gray-900 tracking-wide">Use bonus balance</label>
        </div>
      </div>
      <div slot="footer">
        <button @click="invest" :disabled="loading" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white">Invest</button>
      </div>
    </Modal>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import { mapActions, mapGetters } from 'vuex'
import Modal from '@/components/main/utils/Modal'
import BigNumber from 'bignumber.js'

export default {
  components: {
    Modal
  },

  data () {
    return {
      BigNumber,
      activePlan: '',
      loading: false,
      modal: false,
      form: {
        amount: '',
        useBonus: false
      }
    }
  },

  computed: {
    ...mapGetters({
      plans: 'plan/plans'
    })
  },

  methods: {
    ...mapActions({
      fetchSelf: 'auth/self',
      fetchPlans: 'plan/plans'
    }),

    proceed () {
      if (this.activePlan) {
        this.modal = true
      } else {
        izitoast.error({
          title: 'Error',
          message: 'Please choose a plan!'
        })
      }
    },

    async invest () {
      this.loading = true

      try {
        await axios.post(`/plans/${this.activePlan.id}/invest`, this.form)
        this.fetchSelf()

        this.modal = false

        izitoast.success({
          title: 'Success',
          message: 'Investment has kickstarted!'
        })

        this.$router.push({ name: 'investments' })
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
      } finally {
        this.loading = false
      }
    }
  },

  created () {
    this.fetchPlans()
  }
}
</script>

