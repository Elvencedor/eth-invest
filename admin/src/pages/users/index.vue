<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Users ({{ meta.count || 0 }})</h1>
        <p class="text-gray-600 leading-tight">Add and manage users profile.</p>
      </div>
      <router-link to="/users/new" class="py-2 px-4 bg-indigo-500 focus:bg-indigo-400 text-white rounded shadow text-sm">
        <span class="fa fa-plus mr-1"></span> New user
      </router-link>
    </div>
    <div class="flex flex-wrap align-middle mt-4">
      <div class="w-full md:w-2/3 my-2 justify-center md:justify-left overflow-x-auto">
        <Paginator :count="meta.count" :visiblePage="5" :pageLength="users.length" @pageChanged="fetchUsers" />
      </div>
      <div class="w-full md:w-1/3 my-2 justify-center md:justify-right pl-2 md:justify-end md:text-right">
        <input @input="filterUsers($event)" type="text" class="bg-white px-3 py-2 shadow rounded focus:outline-none text-gray-700 text-sm" placeholder="Filter by ID">
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <TableComponent :columns="table.columns" :items="users" :options="table.options" :loading="table.loading">
        <div slot="sn" slot-scope="props">
          {{ BigNumber(meta.pagination.current).minus(1).times(meta.pagination.limit).plus(props.index + 1).toString() }}
        </div>
        <div slot="id" slot-scope="props">
          {{ truncate(props.item.id, 13) }}
          <button @click="copyToClipboard(props.item.id)" class="p-1 focus:outline-none">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div slot="balance" slot-scope="props">
          ${{ BigNumber(props.item.balance).toFormat(2) }}
        </div>
        <div slot="bonusBalance" slot-scope="props">
          ${{ BigNumber(props.item.bonusBalance).toFormat(2) }}
        </div>
        <div slot="status" slot-scope="props">
          <span v-if="props.item.status === 'deleted'" class="text-gray-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-exclamation text-xl"></i>
          </span>
          <span v-if="props.item.status === 'blocked'" class="text-blue-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-exclamation text-xl"></i>
          </span>
          <span v-if="props.item.status === 'inactive'" class="text-yellow-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-exclamation text-xl"></i>
          </span>
          <span v-if="props.item.status === 'active'" class="text-green-600 text-center inline-block px-3 py-1 rounded-full">
            <i class="fas fa-check-circle text-xl"></i>
          </span>
        </div>
        <div slot="createdAt" slot-scope="props"> {{ formatDate(props.item.createdAt) }} </div>
        <div slot="updatedAt" slot-scope="props">{{ formatDate(props.item.updatedAt) }}</div>
        <div slot="action" slot-scope="props">
          <router-link :to="'/users/' + props.item.id" class="bg-gray-500 px-2 py-1 text-white rounded">
            <i class="fas fa-pen"></i> Edit
          </router-link>
          <button type="button" @click="deleteUser(props.item.id)" class="ml-3 bg-gray-500 px-2 py-1 text-white rounded">
            <i class="fas fa-times"></i> Delete
          </button>
        </div>
      </TableComponent>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import mixins from '@/mixins'
import BigNumber from 'bignumber.js'
import TableComponent from '@/components/main/utils/TableComponent'
import Paginator from '@/components/main/utils/Paginator'

export default {
  name: 'users',
  mixins: [mixins],
  components: {
    Paginator,
    TableComponent
  },
  
  data () {
    return {
      BigNumber,
      users: [],
      meta: {},
      table: {
        loading: false,
        columns: {
          sn: 'S/N',
          id: 'User ID',
          fullName: 'Full Name',
          email: 'Email',
          username: 'Username',
          balance: 'Balance',
          bonusBalance: 'Bonus Balance',
          status: 'Status',
          createdAt: 'Created',
          updatedAt: 'Updated',
          action: 'Action'
        },
        options: {
          columnsClasses: {
            balance: 'text-right',
            bonusBalance: 'text-right',
            status: 'text-center'
          }
        }
      }
    }
  },

  methods: {
    filterUsers (e) {
      this.fetchUsers({ search: e.target.value })
    },

    async fetchUsers (options = null) {
      this.table.loading = true

      if (options) {
        options = Object.keys(options).reduce(function(a,k){a.push(k+'='+encodeURIComponent(options[k]));return a},[]).join('&')
      }

      try {
        const res = await axios.get(`/admin/users${options ? '?' + options : ''}`)

        this.users = res.data.data
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
    },

    async deleteUser (userId) {
      try {
        const res = await axios.delete(`/admin/users/${userId}`)

        this.$set(
          this.users,
          this.users.findIndex(user => user.id === res.data.data.id),
          res.data.data
        )
        
        izitoast.success({
          title: 'Success',
          message: 'User deleted successfull'
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

        izitoast.error({
          title: 'Error',
          message: 'An Unknown error occured.'
        })
      }
    }
  },

  async created () {
    this.fetchUsers()
  }
}
</script>

