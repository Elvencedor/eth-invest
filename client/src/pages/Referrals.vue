<template>
  <section class="px-4 pb-12">
    <div class="py-6">
      <h1 class="text-xl text-gray-900 mb-2">Referral Program</h1>
      <p class="text-gray-600 leading-tight">Your referral bonus statistics.</p> 
    </div>
    <div class="flex flex-wrap">
      <div class="w-full sm:w-2/4">
        <div class="bg-white rounded shadow-md p-4 overflow-x-auto mb-6 sm:mr-3">
          <h3 class="block uppercase text-sm text-gray-600 tracking-wide mb-2">Referral Link</h3>
          <span class="border-b-2">{{ getReferralLink }} </span>
          <button @click="copyToClipboard(getReferralLink)" title="Click to copy" class="ml-1 p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
      <div class="w-full sm:w-2/4">
        <div class="flex bg-white rounded shadow-md p-4 overflow-x-auto mb-6 sm:ml-3">
          <div class="w-1/2 border-r pr-4">
            <h3 class="block uppercase text-sm text-gray-600 tracking-wide mb-2 text-right">Referral Bonus</h3>
            <div class="text-xl text-right">
              <div v-if="meta.stats">
                <span class="mr-1">$</span>{{ BigNumber(meta.stats.bonusTotal).toFormat(2) }}
              </div>
              <span v-else>...</span>
            </div>
          </div>
          <div class="w-1/2">
            <h3 class="block uppercase text-sm text-gray-600 tracking-wide mb-2 text-right">Active Referrals</h3>
            <div class="text-xl text-right">
              <div v-if="meta.stats">{{ meta.stats.referralsCount }}</div>
              <span v-else>...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator :count="meta.count" :visiblePage="5" :pageLength="referrals.length" @pageChanged="fetchReferrals" />
      </div>
      <div class="w-full md:w-1/3 my-2 justify-center md:justify-right md:justify-end md:text-right">
        <input @input="filterReferral($event)" type="text" class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm" placeholder="Filter by benefactor">
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent :columns="table.columns" :items="referrals" :options="table.options" :loading="table.loading">
        <div slot="sn" slot-scope="props">
          {{ BigNumber(meta.pagination.current).minus(1).times(meta.pagination.limit).plus(props.index + 1).toString() }}
        </div>
        <div slot="id" slot-scope="props">
          {{ truncate(props.item.id, 13) }}
          <button @click="copyToClipboard(props.item.id)" class="p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="user" slot-scope="props">
          {{ props.item.user.username }}
        </div>
        <div slot="bonus" slot-scope="props">
          ${{ BigNumber(props.item.bonus).toFormat(2) }}
        </div>
        <div slot="createdAt" slot-scope="props"> {{ formatDate(props.item.createdAt) }} </div>
      </TableComponent>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import mixins from '../mixins'
import axios from 'axios'
import izitoast from 'izitoast'
import BigNumber from 'bignumber.js'
import TableComponent from '@/components/main/utils/TableComponent'
import Paginator from '@/components/main/utils/Paginator'

export default {
  mixins: [mixins],
  components: {
    Paginator,
    TableComponent
  },

  data () {
    return {
      BigNumber,
      referrals: [],
      meta: {},
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'Referral ID',
          user: 'Benefactor',
          bonus: 'Total Bonus',
          createdAt: 'Registered'
        },
        options: {
          columnsClasses: {
            bonus: 'text-right'
          }
        }
      }
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    getReferralLink () {
      const domain = `${window.location.protocol}//${window.location.host.toLowerCase().replace(/www./g, '')}`
      const referralLink = `${domain}?ref=${this.user ? this.user.username : '...'}`

      return referralLink
    }
  },

  methods: {
    async fetchReferrals (options = null) {
      this.table.loading = false

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get(`users/referrals${options ? '?' + options : ''}`)

        this.referrals = res.data.data
        this.meta = res.data.meta
      } catch (err) {
        if (err.response.status === 400) {
          izitoast.error({
            title: 'Error',
            message: err.response.data.errors[0].title
          })
        }
      } finally {
        this.table.loading = false
      }
    },

    filterReferral (e) {
      this.fetchReferrals({ search: e.target.value })
    },
  },

  async created () {
    this.fetchReferrals()
  }
}
</script>

