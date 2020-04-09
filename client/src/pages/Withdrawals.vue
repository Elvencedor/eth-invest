<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center flex-wrap sm:flex-no-wrap">
      <div class="mr-4 sm:mr-0">
        <h1 class="text-xl text-gray-900 mb-2">Withdrawals</h1>
        <p class="text-gray-600 leading-tight">Withdrawals from your balances.</p>
      </div>
      <button @click="openModal" class="py-2 px-4 bg-indigo-500 focus:bg-indigo-400 text-white rounded shadow text-sm text-sm mt-4 sm:mt-0">
        <span class="fa fa-share mr-1"></span> Withdraw Funds
      </button>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator :count="meta.count" :visiblePage="5" :pageLength="withdrawals.length" @pageChanged="fetchWithdrawals" />
      </div>
      <div class="w-full md:w-1/3 my-2 justify-center md:justify-right pl-2 md:justify-end md:text-right">
        <input @input="filterWithdrawal($event)" type="text" class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm" placeholder="Filter by ID">
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent :columns="table.columns" :items="withdrawals" :options="table.options" :loading="table.loading">
        <div slot="sn" slot-scope="props">
          {{ BigNumber(meta.pagination.current).minus(1).times(meta.pagination.limit).plus(props.index + 1).toString() }}
        </div>
        <div slot="id" slot-scope="props">
          {{ truncate(props.item.id, 13) }}
          <button @click="copyToClipboard(props.item.id)" class="p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="amount" slot-scope="props">
          ${{ BigNumber(props.item.amount).toFormat(2) }}
        </div>
        <div slot="status" slot-scope="props">
          <span v-if="props.item.status === 'cancelled'" class="text-red-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-ban text-xl"></i>
          </span>
          <span v-if="props.item.status === 'rejected'" class="text-red-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-exclamation-triangle text-xl"></i>
          </span>
          <span v-if="props.item.status === 'pending'" class="text-yellow-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-clock text-xl"></i>
          </span>
          <span v-if="props.item.status === 'completed'" class="text-green-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-check-circle text-xl"></i>
          </span>
        </div>
        <div slot="txid" slot-scope="props">
          <div v-if="props.item.beneficiary">
            Transfer to <span class="text-green-500">{{ truncate(props.item.beneficiary.username, 16) }}</span>
            <button @click="copyToClipboard(props.item.beneficiary.username)" class="p-1 focus:outline-none">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div v-else-if="props.item.txid">
            {{ truncate(props.item.txid, 13) }}
            <button @click="copyToClipboard(props.item.txid)" class="p-1 focus:outline-none">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div v-else>-</div>
        </div>
        <div slot="target" slot-scope="props" class="text-center">
          <div v-if="props.item.target">
            {{ truncate(props.item.target, 13) }}
            <button @click="copyToClipboard(props.item.target)" class="p-1 focus:outline-none">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div v-else class="text-gray-400">N/A</div>
        </div>
        <div slot="createdAt" slot-scope="props"> {{ formatDate(props.item.createdAt) }} </div>
        <div slot="updatedAt" slot-scope="props">{{ formatDate(props.item.updatedAt) }}</div>
        <div slot="actions" slot-scope="props">
          <button
            v-if="props.item.status === 'pending'"
            @click="cancelWithdrawal(props.item.id)"
            :disabled="loader.cancel"
            class="bg-red-500 text-white py-1 px-2 rounded"
          >
            Cancel
          </button>
        </div>
      </TableComponent>
    </div>
    <Modal v-if="modal" v-on:close="modal = false">
      <div slot="title">Request Withdrawal</div>
      <div slot="content">
        <div>
          <label for="amount" class="block uppercase text-sm text-gray-900 tracking-wide">Amount(USD)</label>
          <input
            type="test"
            id="amount"
            v-model="form.amount"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            placeholder="0.00"
          >
        </div>
      </div>
      <div slot="footer">
        <button @click="submit" :disabled="loader.request" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white">
          <span v-if="loader.request" class="fas fa-spinner fa-spin"></span>
          <span v-else>Request</span>
        </button>
      </div>
    </Modal>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import { mapActions } from 'vuex'
import mixins from '../mixins'
import Paginator from '@/components/main/utils/Paginator'
import TableComponent from '@/components/main/utils/TableComponent'
import Modal from '@/components/main/utils/Modal'
import BigNumber from 'bignumber.js'

export default {
  name: 'withdrawals',
  mixins: [mixins],

  components: {
    Modal,
    Paginator,
    TableComponent
  },

  data () {
    return {
      BigNumber,
      modal: false,
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'Withdrawal ID',
          amount: 'Amount',
          status: 'Status',
          txid: 'TXID/Meta',
          target: 'Target',
          createdAt: 'Created',
          updatedAt: 'Updated',
          actions: ''
        },
        options: {
          columnsClasses: {
            amount: 'text-right',
            status: 'text-center'
          }
        }
      },
      loader: {
        request: false,
        cancel: false
      },
      withdrawals: [],
      meta: {},
      form: {
        amount: ''
      }
    }
  },

  methods: {
    ...mapActions({
      fetchSelf: 'auth/self'
    }),

    openModal () {
      this.modal = true
    },

    async submit () {
      this.loader.request = true

      try {
        const res = await axios.post('/withdrawals', this.form)

        this.fetchSelf()

        this.withdrawals = [...this.withdrawals, res.data.data]
        this.modal = false

        izitoast.info({
          title: 'Success',
          message: 'Your withdrawal request has been submitted!'
        })
        this.fetchWithdrawals()
      } catch (err) {
        this.modal = false

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
        this.loader.request = false
      }
    },

    async cancelWithdrawal (withdrawalId) {
      this.loader.request = true

      try {
        await axios.delete(`/withdrawals/${withdrawalId}`)
        this.fetchSelf()

        const withdrawal = this.withdrawals.find(w => w.id === withdrawalId)
        withdrawal.status = 'cancelled'

        izitoast.success({
          title: 'Success',
          message: 'Withdrawal successfully cancelled.'
        })
      } catch (err) {
        if (err.response.status >= 400) {
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
        this.loader.cancel = false
      }
    },

    async fetchWithdrawals (options = null) {
      this.table.loading = true

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get(`/withdrawals${options ? '?' + options : ''}`)

        this.withdrawals = res.data.data
        this.meta = res.data.meta
      } catch (err) {
        if (err.response.status === 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }

        izitoast.error({
          title: 'Error',
          message: 'An error occured!'
        })
      } finally {
        this.table.loading = false
      }
    },

    filterWithdrawal (e) {
      this.fetchWithdrawals({ search: e.target.value })
    },
  },

  async created () {
    this.fetchWithdrawals()
  }
}
</script>

