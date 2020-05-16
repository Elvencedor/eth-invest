<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center flex-wrap sm:flex-no-wrap">
      <div class="mr-4 sm:mr-0">
        <h1 class="text-xl text-gray-900 mb-2">Investments</h1>
        <p class="text-gray-600 leading-tight">View your running and completed investments.</p>
      </div>
      <router-link to="/invest" class="py-2 px-4 bg-indigo-500 focus:bg-indigo-400 text-white rounded shadow text-sm mt-4 sm:mt-0">
        <span class="fa fa-plus mr-1"></span> New Investment
      </router-link>
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
          {{ truncate(props.item.id, 13) }}
          <button @click="copyToClipboard(props.item.id)" class="p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="plan" slot-scope="props">
          {{ props.item.plan.name }} ({{ props.item.percentage }}%, {{ props.item.duration }} days)
        </div>
        <div slot="capital" slot-scope="props">
          ${{ BigNumber(props.item.amount).toFormat(2) }}
        </div>
        <div slot="yield" slot-scope="props">
          ${{ BigNumber(props.item.amount).times(props.item.percentage).div(100).plus(props.item.amount).toFormat(2) }} / {{ BigNumber(props.item.amount).times(props.item.percentage).div(100).plus(props.item.amount).div(priceState.oneEthToUsdPrice).toFormat(8) || '...' }} ETH
        </div>
        <div slot="status" slot-scope="props">
          <span v-if="props.item.status === 'running'" class="text-yellow-600 text-center inline-block px-3 py-1 rounded-full">
            {{ props.item.daysElapsed + '/' + props.item.duration }} days
          </span>
          <span v-if="props.item.status === 'completed'" class="text-green-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-check-circle text-xl"></i>
          </span>
        </div>
        <div slot="createdAt" slot-scope="props"> {{ formatDate(props.item.createdAt) }} </div>
      </TableComponent>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import TableComponent from '@/components/main/utils/TableComponent'
import Paginator from '@/components/main/utils/Paginator'
import mixins from '../mixins'
import BigNumber from 'bignumber.js'

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
      priceState: {},
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'Investment ID',
          plan: 'Plan',
          capital: 'Capital',
          yield: 'Yield',
          status: 'Status',
          createdAt: 'Created'
        },
        options: {
          columnsClasses: {
            amount: 'text-right',
            status: 'text-center'
          }
        }
      },
      meta: {}
    }
  },

  methods: {
    async fetchInvestments (options = null) {
      this.table.loading = true

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get(`/investments${options ? '?' + options : ''}`)

        this.investments = res.data.data
        this.meta = res.data.meta
      } catch (err) {
        if (err.response.status === 400) {
          izitoast.error({
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
    },

    filterInvestments (e) {
      this.fetchInvestments({ search: e.target.value })
    },

    async fetchConversion () {
      const priceState = await axios.get(`/stats/conversion`)
      this.priceState = priceState.data.data
    }
  },

  async created () {
    await this.fetchConversion()
    this.fetchInvestments()

    this.interval = setInterval(async () => {
      await this.fetchConversion()
    }, 45000)
  },

  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

