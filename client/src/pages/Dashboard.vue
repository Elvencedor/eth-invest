<template>  
  <section class="py-6 px-4">
    <div class="mb-6">
      <h1 class="text-xl text-gray-900 mb-2">Dashboard</h1>
      <p class="text-gray-600 leading-tight">Portfolio and statistical data.</p>
    </div>
    <div class="overflow-x-auto flex flex-wrap">
      <div class="w-full sm:w-1/4">
        <div class="bg-blue-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
          <div class="text-white tracking-wide text-sm text-right mb-1">Account Balance</div>
          <div class="text-white text-2xl text-right"><span class="pr-1">$</span>{{ BigNumber(user.balance || 0).toFormat(2) }}</div>
        </div>
      </div>
      <div class="w-full sm:w-1/4">
        <div class="bg-purple-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
          <div class="text-white tracking-wide text-sm text-right mb-1">Bonus/Gift Balance</div>
          <div class="text-white text-2xl text-right"><span class="pr-1">$</span>{{ BigNumber(user.bonusBalance || 0).toFormat(2) }}</div>
        </div>
      </div>
      <div class="w-full sm:w-1/4">
        <div class="bg-green-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
          <div class="text-white tracking-wide text-sm text-right mb-1">Growing Balance</div>
          <div class="text-white text-2xl text-right"><span class="pr-1">$</span>{{ BigNumber(stats.growingBalance || 0).toFormat(2) }}</div>
        </div>
      </div>
      <div class="w-full sm:w-1/4">
        <div class="bg-red-500 shadow my-2 sm:mx-4 sm:ml-0 p-4 rounded">
          <div class="text-white tracking-wide text-sm text-right mb-1">Pending Withdrawals</div>
          <div class="text-white text-2xl text-right">{{ stats.pendingWithdrawalCount || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap my-6">
      <div class="w-full sm:w-3/5">
        <div class="bg-white p-6 rounded shadow-md">
          <div class="flex justify-between items-center flex-wrap sm:flex-no-wrap">
            <h3 class="text-xl text-gray-900 mr-4 sm:mr-0">{{ greeting }}</h3>
            <router-link to="/invest" class="py-2 px-4 bg-indigo-500 focus:bg-indigo-400 text-white rounded shadow text-sm mt-4 sm:mt-0">
              Invest Now
            </router-link>
          </div>
          <div class="mt-6 text-sm">
            Welcome to your live dashboard.
          </div>
          <div class="flex flex-wrap justify-between max-w-2xl">
            <div v-for="(h, i) in help" :key="i" class="mt-4 w-full">
              <button
                @click="selectQuestion(i)"
                class="text-white shadow-lg bg-gray-800 py-2 px-4 rounded-lg w-full text-left text-sm focus:outline-none focus:shadow-2xl focus:bg-red-500"
                :class="selectedQuestion !== i ? '' : 'bg-red-500'"
              >
                {{ h.question }}
                <span class="fa text-xs float-right py-1" :class="selectedQuestion !== i ? 'fa-plus' : 'fa-minus'"></span>
              </button>
              <p class="p-4 text-black text-sm" :class="selectedQuestion !== i ? 'hidden' : ''" v-html="h.answer"></p>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full sm:w-2/5">
        <div class="mt-6 sm:mt-0 sm:ml-4 rounded shadow-md">
          <div class="bg-white p-6 rounded-t">
            <h3 class="text-xl text-gray-900">Funds Transfer</h3>
            <form class="mt-6">
              <div>
                <label for="beneficiary" class="block uppercase text-xs text-gray-900 tracking-wide">Beneficiary (username)</label>
                <input
                  type="test"
                  id="beneficiary"
                  v-model="$v.form.beneficiary.$model"
                  class="block w-full mt-3 bg-gray-200 py-2 px-4 rounded focus:outline-none text-sm text-gray-700"
                  autocomplete="off"
                  placeholder="Example: user123"
                >
                <!-- <p class="text-xs text-red-500 italic" v-if="$v.form.beneficiary.$error && !$v.form.beneficiary.required">Beneficiary is required</p> -->
              </div>
              <div class="mt-6">
                <label for="amount" class="block uppercase text-xs text-gray-900 tracking-wide">Amount (USD)</label>
                <input
                  type="test"
                  id="amount"
                  v-model="$v.form.amount.$model"
                  class="block w-full mt-3 bg-gray-200 py-2 px-4 rounded focus:outline-none text-sm text-gray-700"
                  autocomplete="off"
                  placeholder="0.00"
                >
                <!-- <p class="text-xs text-red-500 italic" v-if="$v.form.amount.$error && !$v.form.amount.required">Amount is required</p> -->
              </div>
            </form>
          </div>
          <div class="py-4 px-6">
            <button @click="confirmFundTransfer" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white">Transfer funds</button>
          </div>
        </div>
      </div>
    </div>
    <Modal v-if="transferModal" v-on:close="transferModal = false">
      <div slot="title">Confirm Transfer</div>
      <div slot="content">
        <p class="bg-red-100 text-sm text-red-800 px-4 py-2 rounded">
          Enter your password to confirm transfer
        </p>
        <div class="mt-6">
          <label for="txid" class="block uppercase text-sm text-gray-900 tracking-wide">Password</label>
          <input
            type="password"
            id="password"
            v-model="$v.form.password.$model"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            autocomplete="off"
            placeholder="********"
          >
          <!-- <p class="text-xs text-red-500 italic" v-if="$v.form.password.$error && !$v.form.password.required">Password is required</p> -->
        </div>
      </div>
      <div slot="footer">
        <button @click="transferFund" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white disabled:opacity-50" :disabled="loading">
          <span v-if="loading" class="fas fa-spinner fa-spin"></span>
          <span v-else>Confirm</span>
        </button>
      </div>
    </Modal>
  </section>
</template>

<script>
  import axios from 'axios'
  import izitoast from 'izitoast'
  import { mapGetters, mapActions } from 'vuex'
  import BigNumber from 'bignumber.js'
  import Modal from '@/components/main/utils/Modal'
  import { required } from 'vuelidate/lib/validators'

  export default {
    components: {
      Modal
    },
    data () {
      return {
        stats: {},
        BigNumber: BigNumber,
        now: new Date(),
        selectedQuestion: null,
        transferModal: false,
        loading: false,
        form: {
          beneficiary: '',
          amount: '',
          password: ''
        },
        help: [
          {
            question: 'How do I get started?',
            answer: 'Top up your account balance to meet the requirements of your choice of investment plan, then proceed to make an investment.'
          },
          {
            question: 'How do I top up my balance?',
            answer: 'Go to <a href="/deposits" class="text-blue-700">deposits</a> and follow the instructions to make a deposit.'
          },
          {
            question: 'How do I invest?',
            answer: 'Click the &ldquo;Invest Now&rdquo; button and choose an investment plan, then supply an amount to commit.'
          },
          {
            question: 'How do I make a withdrawal?',
            answer: 'Go to <a href="/withdrawals" class="text-blue-700">withdrawals</a> and follow the instructions to make a withdrawal.'
          }
        ]
      }
    },

    validations: {
      form: {
        beneficiary: {
          required
        },
        amount: {
          required
        },
        password: {
          required
        }
      }
    },

    computed: {
      ...mapGetters({
        user: 'auth/user'
      }),

      greeting () {
        if (this.now.getHours() < 12) {
          return `Good morning${this.user.fullName ? `, ${this.user.fullName}` : ''}!`
        } else if (this.now.getHours() < 17) {
          return `Good afternoon${this.user.fullName ? `, ${this.user.fullName}` : ''}!`
        } else {
          return `Good evening${this.user.fullName ? `, ${this.user.fullName}` : ''}!`
        }
      }
    },

    methods: {
      ...mapActions({
        fetchSelf: 'auth/self'
      }),

      selectQuestion (index) {
        if (this.selectedQuestion !== index) {
          this.selectedQuestion = index
        } else {
          this.selectedQuestion = null
        }
      },

      confirmFundTransfer () {
        this.transferModal = true
      },

      async transferFund () {
        this.$v.$touch()

        if (this.$v.$invalid) {
          izitoast.error({
            title: 'Error',
            message: 'All input fields are required!'
          })

          return false
        }

        this.loading = true

        try {
          await axios.post('/users/transfer', this.form)
          await this.fetchSelf()

          this.form.beneficiary = this.form.amount = ''
          this.transferModal = false
          this.form.password = ''

          izitoast.success({
            title: 'Success',
            message: 'Funds transferred successfully'
          })
          this.$router.push('/withdrawals')
        } catch (err) {
          this.transferModal = false
          this.form.password = ''

          if (err.response && err.response.status === 400) {
            return izitoast.error({
              title: 'Error',
              message: err.response.data.errors[0].title
            })
          }
        } finally {
          this.loading = false
        }
      }
    },

    async created () {
      try {
        await this.fetchSelf()
        const res = await axios.get('/stats')
        
        this.stats = res.data.data
      } catch (err) {
        if (err.response && err.response.status === 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      }
    }
 }
 
</script>
