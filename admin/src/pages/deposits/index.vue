<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Deposits ({{ meta.count || 0 }})</h1>
        <p class="text-gray-600 leading-tight">View and manage deposits.</p>
      </div>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator :count="meta.count" :visiblePage="5" :pageLength="deposits.length" @pageChanged="fetchDeposits" />
      </div>
      <div class="w-full md:w-1/3 my-2 justify-center md:justify-right pl-2 md:justify-end md:text-right">
        <input @input="filterDeposits($event)" type="text" class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm" placeholder="Filter by ID">
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent :columns="table.columns" :items="deposits" :options="table.options" :loading="table.loading">
        <div slot="sn" slot-scope="props">
          {{ BigNumber(meta.pagination.current).minus(1).times(meta.pagination.limit).plus(props.index + 1).toString() }}
        </div>
        <div slot="id" slot-scope="props">
          {{ truncate(props.item.id) }}
          <button @click="copyToClipboard(props.item.id)" class="p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="userId" slot-scope="props">
          {{ truncate(props.item.userId) }}
          <button @click="copyToClipboard(props.item.userId)" class="p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="amount" slot-scope="props">
          ${{ BigNumber(props.item.amount).toFormat(2) }}
        </div>
        <div slot="csoAmount" slot-scope="props">
          {{ BigNumber(props.item.csoAmount).toFormat(2) }}
        </div>
        <div slot="txid" slot-scope="props">
          <div v-if="props.item.status === 'cancelled'">-</div>
          <div v-else>
            <button @click="comfirmDesposit(props.item)" v-if="props.item.txid === null || props.item.txid === ''" class="bg-blue-500 px-2 py-1 text-white rounded">Submit TXID</button>
            <div v-else>
              <span>{{ truncate(props.item.txid) }} </span>
              <button @click="copyToClipboard(props.item.txid)" class="p-1 focus:outline-none">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
        <div slot="status" slot-scope="props">
          <span v-if="props.item.status === 'cancelled'" class="text-red-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-times text-xl"></i>
          </span>
          <span v-if="props.item.status === 'pending'" class="text-yellow-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-clock text-xl"></i>
          </span>
          <span v-if="props.item.status === 'completed'" class="text-green-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-check-circle text-xl"></i>
          </span>
        </div>
        <div slot="createdAt" slot-scope="props"> {{ formatDate(props.item.createdAt) }} </div>
        <div slot="updatedAt" slot-scope="props">{{ formatDate(props.item.updatedAt) }}</div>
        <div slot="action" slot-scope="props">
          <button type="button" v-if="props.item.status === 'pending'" @click="cancelDeposit(props.item.id)" class="ml-3 bg-gray-500 px-2 py-1 text-white rounded disabled:opacity-50">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button type="button" v-if="props.item.status === 'cancelled'" @click="rependDeposit(props.item.id)" class="ml-3 bg-gray-500 px-2 py-1 text-white rounded disabled:opacity-50">
            <i class="fas fa-check"></i> Repend
          </button>
        </div>
      </TableComponent>
    </div>
    <Modal v-if="updateDepositModal" v-on:close="updateDepositModal = false">
      <div slot="title">Confirm Deposit</div>
      <div slot="content">
        <p class="bg-red-100 text-sm text-red-800 px-4 py-2 rounded">
          N/B: This will complete the deposit for the concern user
        </p>
        <div class="mt-10">
          <label for="txid" class="block uppercase text-sm text-gray-900 tracking-wide">Transaction ID</label>
          <input
            type="test"
            id="txid"
            v-model="txid"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            autocomplete="off"
            placeholder="<Enter TXID here>"
          >
        </div>
      </div>
      <div slot="footer">
        <button @click="submitTxid" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white" :disabled="depositBtn.update">
          <span v-if="depositBtn.update" class="fas fa-spinner fa-spin"></span>
          <span v-else>Update</span>
        </button>
      </div>
    </Modal>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import mixins from '@/mixins'
import BigNumber from 'bignumber.js'
import TableComponent from '@/components/main/utils/TableComponent'
import Paginator from '@/components/main/utils/Paginator'
import Modal from '@/components/main/utils/Modal'

export default {
  name: 'users',
  mixins: [mixins],
  components: {
    Paginator,
    TableComponent,
    Modal
  },

  data () {
    return {
      BigNumber,
      deposits: [],
      meta: {},
      txid: '',
      selectedDeposit: '',
      updateDepositModal: false,
      depositBtn: {
        update: false
      },
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'Deposit ID',
          userId: 'User ID',
          amount: 'Amount (USD)',
          csoAmount: 'Amount (CSO)',
          txid: 'TXID',
          status: 'Status',
          createdAt: 'Created',
          updatedAt: 'Updated',
          action: 'Action'
        },
        options: {
          columnsClasses: {
            amount: 'text-right',
            csoAmount: 'text-right',
            status: 'text-center'
          }
        }
      },
    }
  },

  methods: {
    filterDeposits (e) {
      this.fetchDeposits({ search: e.target.value })
    },

    async fetchDeposits (options = null) {
      this.table.loading = true

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get(`/admin/deposits${options ? '?' + options : ''}`)

        this.deposits = res.data.data
        this.meta = res.data.meta
      } catch (err) {
        if (!err.response) {
          return izitoast.error({
            title: 'Error',
            message: 'Could not connect to server. Please try later.'
          })
        }

        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      } finally {
        this.table.loading = false
      }
    },

    async cancelDeposit (depositId) {
      try {
        const res = await axios.put(`/admin/deposits/${depositId}`)

        this.$set(
          this.deposits,
          this.deposits.findIndex(deposit => deposit.id === res.data.data.id),
          res.data.data
        )
        
        izitoast.success({
          title: 'Success',
          message: 'Deposit cancelled successfull'
        })
      } catch (err) {
        if (!err.response) {
          return izitoast.error({
            title: 'Error',
            message: 'Could not connect to server. Please try later.'
          })
        }

        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      }
    },

    async rependDeposit (depositId) {
      try {
        const res = await axios.put(`/admin/deposits/${depositId}/repend`)

        this.$set(
          this.deposits,
          this.deposits.findIndex(deposit => deposit.id === res.data.data.id),
          res.data.data
        )
        
        izitoast.success({
          title: 'Success',
          message: 'Deposit repend successfull'
        })
      } catch (err) {
        if (!err.response) {
          return izitoast.error({
            title: 'Error',
            message: 'Could not connect to server. Please try later.'
          })
        }

        if (err.response.status >= 400) {
          return izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      }
    },

    comfirmDesposit (deposit) {
      this.txid = ''
      this.selectedDeposit = deposit
      this.updateDepositModal = true 
    },

    async submitTxid () {
      this.depositBtn.update = true

      try {
        const res = await axios.put(`/admin/deposits/${this.selectedDeposit.id}/hash`, { txid: this.txid })

        this.$set(
          this.deposits,
          this.deposits.findIndex(d => d.id === this.selectedDeposit.id),
          res.data.data
        )
        this.updateDepositModal = false
        izitoast.success({
          title: 'Success',
          message: 'Transaction is now completed!'
        })
      } catch (err) {
        err.response.data.errors.forEach(error => {
          izitoast.error({
            title: 'Error',
            message: error.title
          })
        })
      } finally {
        this.depositBtn.update = false
      }
    },
  },

  async created () {
    this.fetchDeposits()
  }
}
</script>

