<template>
  <table class="w-full border-collapses text-left text-sm">
    <thead>
      <tr class="border-b">
        <th v-for="(column, name) in columns" :key="name" class="font-semibold py-3 px-3 uppercase whitespace-no-wrap" :class="options.columnsClasses ? options.columnsClasses[name] : ''">{{ column | capitalize }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="loading">
        <td colspan="7" class="text-center px-4 py-6 text-gray-600">
          <i class="fas fa-spinner fa-spin mr-2"></i> Loading data...
        </td>
      </tr>
      <tr v-else-if="!items.length">
        <td colspan="20" class="text-center px-4 py-6 text-gray-600">
          No data available.
        </td>
      </tr>
      <tr v-else v-for="(item, index) in items" :key="index" class="hover:bg-grey-darker">
        <td v-for="(column, name, i) in columns" slot="column" :key="i" class="border-t py-2 px-3 whitespace-no-wrap" :class="[Object.keys(columns).length - 1 === i ? '': 'border-r', options.columnsClasses ? options.columnsClasses[name] : '']">
          <slot :name="name" :item="item" :index="index">
            {{item[name]}}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    items: Array,
    columns: [Array, Object],
    loading: Boolean,
    options: Object
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  }
}
</script>
