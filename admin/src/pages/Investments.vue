<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Investments ({{ meta.count || 0 }})</h1>
        <p class="text-gray-600 leading-tight">View all users investments.</p>
      </div>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator :count="meta.count" :visiblePage="5" :pageLength="investments.length" @pageChanged="fetchInvestments" />
      </div>
      <div class="w-full md:w-1/3 my-2 justify-center md:justify-right pl-2 md:justify-end md:text-right">
        <input @input="filterInvestments($event)" type="text" class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm" placeholder="Filter by ID">
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent :columns="table.columns" :items="investments" :options="table.options" :loading="table.loading">
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
        <div slot="plan" slot-scope="props">
          {{ props.item.plan.name }} ({{ props.item.percentage }}%, {{ props.item.duration }} Days)
        </div>
        <div slot="amount" slot-scope="props">
          ${{ BigNumber(props.item.amount).toFormat(2) }}
        </div>
        <div slot="growth" slot-scope="props">
          <span v-if="props.item.status === 'running'">${{ BigNumber(getGrowth(props.item.amount, props.item.percentage, props.item.daysElapsed, props.item.duration)).toFormat(2) }}</span>
          <span v-else class="text-gray-500">N/A</span>
        </div>
        <div slot="yield" slot-scope="props">
          ${{ BigNumber(getYield(props.item.amount, props.item.percentage)).toFormat(2) }}
        </div>
        <div slot="status" slot-scope="props">
          <span v-if="props.item.status === 'running'" class="text-blue-600 text-center inline-block px-3 py-1 rounded-full">
             {{ props.item.daysElapsed + '/' + props.item.duration }} Days
          </span>
          <span v-if="props.item.status === 'completed'" class="text-green-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-check-circle text-xl"></i>
          </span>
        </div>
        <div slot="createdAt" slot-scope="props"> {{ formatDate(props.item.createdAt) }} </div>
        <div slot="updatedAt" slot-scope="props">{{ formatDate(props.item.updatedAt) }}</div>
      </TableComponent>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import mixins from '../mixins'
import BigNumber from 'bignumber.js'
import TableComponent from '@/components/main/utils/TableComponent'
import Paginator from '@/components/main/utils/Paginator'

export default {
  name: 'investments',
  mixins: [mixins],
  components: {
    Paginator,
    TableComponent
  },
  data () {
    return {
      BigNumber,
      investments: [],
      meta: {},
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'Investment ID',
          userId: 'User ID',
          plan: 'Plan',
          amount: 'Amount',
          growth: 'Growth',
          yield: 'Yield',
          status: 'Status',
          createdAt: 'Created',
          updatedAt: 'Updated',
        },
        options: {
          columnsClasses: {
            amount: 'text-right',
            status: 'text-center'
          }
        }
      },
    }
  },

  methods: {
    getGrowth (amt, percentage, dElapsed, dTotal) {
      const projectedBalance = new BigNumber(amt)
        .times(percentage)
        .div(100)
        .plus(amt)
      const frag = projectedBalance.div(dTotal)

      return frag.times(dElapsed).toString()
    },

    getYield (amt, percentage) {
      return new BigNumber(amt)
        .times(percentage)
        .div(100)
        .plus(amt)
        .toString()
    },

    filterInvestments (e) {
      this.fetchInvestments({ search: e.target.value })
    },

    async fetchInvestments (options = null) {
      this.table.loading = true

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get('/admin/investments')

        this.investments = res.data.data
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

        izitoast.error({
          title: 'Error',
          message: 'An Unknown error occured.'
        })
      } finally {
        this.table.loading = false
      }
    }
  },

  created () {
    this.fetchInvestments()
  }
}
</script>

