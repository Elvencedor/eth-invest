<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Withdrawals ({{ meta.count || 0 }})</h1>
        <p class="text-gray-600 leading-tight">View and process users withdrawal requests.</p>
      </div>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator :count="meta.count" :visiblePage="5" :pageLength="withdrawals.length" @pageChanged="fetchWithdrawals" />
      </div>
      <div class="w-full md:w-1/3 my-2 justify-center md:justify-right pl-2 md:justify-end md:text-right">
        <input @input="filterWithdrawals($event)" type="text" class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm" placeholder="Filter by ID">
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent :columns="table.columns" :items="withdrawals" :options="table.options" :loading="table.loading">
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
          <div v-if="props.item.txid">
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
            @click="rejectWithdrawal(props.item.id)"
            :disabled="loader.reject"
            class="bg-red-500 hover:bg-red-400 text-white py-1 px-2 rounded"
          >
            <span v-if="loader.reject" class="fas fa-spinner fa-spin"></span>
            <span v-else>Reject</span>
          </button>
          <button
            v-if="props.item.status === 'pending'"
            @click="approveWithdrawal(props.item)"
            :disabled="loader.reject"
            class="ml-2 bg-indigo-500 hover:bg-indigo-400 text-white py-1 px-2 rounded"
          >
            <span v-if="loader.reject" class="fas fa-spinner fa-spin"></span>
            <span v-else>Approve</span>
          </button>
        </div>
      </TableComponent>
    </div>
    <Modal v-if="openModal" @close="openModal = false">
      <div slot="title">Approve Withdrawal</div>
      <div slot="content">
        <div>
          <label for="txid" class="block uppercase text-sm text-gray-900 tracking-wide">Transaction ID</label>
          <input
            type="test"
            id="txid"
            v-model="form.txid"
            class="block w-full mt-3 bg-gray-200 p-4 rounded focus:outline-none text-gray-700"
            autocomplete="off"
            placeholder="<Enter TXID here>"
          >
        </div>
        <div class="mt-6">
          <label for="verify" class="block uppercase text-sm text-gray-900 tracking-wide">Verify transaction</label>
          <input
            type="checkbox"
            id="verify"
            v-model="form.verify"
            class="block mt-3  focus:outline-none"
          >
        </div>
      </div>
      <div slot="footer">
        <button @click="approve" class="w-full p-3 bg-indigo-500 hover:bg-indigo-400 rounded text-white" :disabled="loader.approve">
          <span v-if="loader.approve" class="fas fa-spinner fa-spin"></span>
          <span v-else>Save</span>
        </button>
      </div>
    </Modal>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import mixins from '../mixins'
import Modal from '@/components/main/utils/Modal'
import TableComponent from '@/components/main/utils/TableComponent'
import Paginator from '@/components/main/utils/Paginator'
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
      openModal: false,
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'Withdrawal ID',
          userId: 'User ID',
          amount: 'Amount',
          status: 'Status',
          txid: 'TXID',
          target: 'BTC Address',
          createdAt: 'Created',
          updatedAt: 'Updated',
          actions: 'Actions'
        },
        options: {
          columnsClasses: {
            amount: 'text-right',
            status: 'text-center'
          }
        }
      },
      loader: {
        approve: false,
        reject: false
      },
      form: {
        txid: '',
        verify: true
      },
      selectedWithdrawal: null,
      withdrawals: [],
      meta: {}
    }
  },

  methods: {
    approveWithdrawal (withdrawal) {
      this.txid = ''
      this.selectedWithdrawal = withdrawal
      this.openModal = true
    },

    filterWithdrawals (e) {
      this.fetchWithdrawals({ search: e.target.value })
    },

    async fetchWithdrawals (options = null) {
      this.table.loading = true

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get(`/admin/withdrawals${options ? '?' + options : ''}`)

        this.withdrawals = res.data.data
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

    async approve () {
      this.loader.approve = true

      try {
        const res = await axios.put(`/admin/withdrawals/${this.selectedWithdrawal.id}?action=approve`, this.form)

        this.$set(
          this.withdrawals,
          this.withdrawals.findIndex(withdrawal => withdrawal.id === res.data.data.id),
          res.data.data
        )

        this.openModal = false

        izitoast.success({
          title: 'Success',
          message: 'Withdrawal successfully approved.'
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
      } finally {
        this.loader.approve = false
      }
    },

    async rejectWithdrawal (withdrawalId) {
      this.loader.reject = true

      try {
        const res = await axios.put(`/admin/withdrawals/${withdrawalId}?action=reject`)

        this.$set(
          this.withdrawals,
          this.withdrawals.findIndex(withdrawal => withdrawal.id === res.data.data.id),
          res.data.data
        )

        izitoast.success({
          title: 'Success',
          message: 'Withdrawal successfully deleted.'
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
      } finally {
        this.loader.reject = false
      }
    }
  },

  created () {
    this.fetchWithdrawals()
  }
}
</script>

