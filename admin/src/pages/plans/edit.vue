<template>
  <section class="px-4 pb-12">
    <div class="py-6 flex justify-between items-center">
      <div>
        <h1 class="text-xl text-gray-900 mb-2">Edit Plan</h1>
        <p class="text-gray-600 leading-tight">Edit plan data</p>
      </div>
    </div>
    <div class="bg-white rounded shadow-md p-1 overflow-x-auto mt-4">
      <form @submit.prevent="submit" class="p-4 flex flex-wrap">
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="name">Name</label>
            <input type="text" v-model="$v.plan.name.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="name">
            <p class="text-xs text-red-500 italic" v-if="$v.plan.name.$error && !$v.plan.name.required">Name is required</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="duration">Duration (days)</label>
            <input type="text" v-model="$v.plan.duration.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="duration">
            <p class="text-xs text-red-500 italic" v-if="$v.plan.duration.$error && !$v.plan.duration.required">Duration is required</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="percentage">Percentage</label>
            <input type="text" v-model="$v.plan.percentage.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="percentage">
            <p class="text-xs text-red-500 italic" v-if="$v.plan.percentage.$error && !$v.plan.percentage.required">Percentage is required</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="bonus-balance">Minimum amount</label>
            <input type="text" v-model="$v.plan.minimumAmount.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black" id="bonus-balance">
            <p class="text-xs text-red-500 italic" v-if="$v.plan.minimumAmount.$error && !$v.plan.minimumAmount.required">Minimum amount is required</p>
          </div>
        </div>
        <div class="w-full sm:w-1/3">
          <div class="p-3">
            <label for="status">Status</label>
            <select id="status" v-model="$v.plan.status.$model" class="mt-3 w-full rounded-lg py-3 px-6 bg-gray-200 text-black">
              <option value="" disabled selected>[Select status]</option>
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
        <div class="w-full">
          <div class="p-3">
            <button type="submit" class="mt-3 rounded-lg py-3 px-6 bg-indigo-500 hover:bg-indigo-400 text-white">Update</button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import izitoast from 'izitoast'
import mixins from '@/mixins'
import BigNumber from 'bignumber.js'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'planEdit',
  mixins: [mixins],


  data () {
    return {
      BigNumber,
      plan: {}
    }
  },

  validations: {
    plan: {
      name: {
        required
      },
      duration: {
        required
      },
      percentage: {
        required
      },
      minimumAmount: {
        required
      },
      status: {}
    }
  },

  methods: {
    async submit () {
      this.$v.$touch()
      
      if (this.$v.$invalid) {
        return izitoast.error({
          title: 'Error',
          message: 'All input fields error must be resolved!'
        })
      }

      try {
        // request
        await axios.put(`/admin/plans/${this.plan.id}`, this.plan)

        izitoast.success({
          title: 'Success',
          message: 'Plan updated successfull'
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
    try {
      const res = await axios.get(`/admin/plans/${this.$route.params.id}`)
      this.plan = res.data.data
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
  }
}
</script>

