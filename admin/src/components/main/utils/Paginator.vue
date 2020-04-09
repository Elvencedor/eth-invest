<template> 
  <ul class="inline-flex list-reset border border-gray-300 rounded w-auto font-sans text-sm bg-white text-gray-700">
    <li>
      <button 
        type="button"
        @click="onClickFirstPage"
        :disabled="isInFirstPage"
        class="block border-r border-gray-300 px-3 py-2 rounded-l disabled:opacity-50"
      >&lt;&lt;
      </button>
    </li>
    <li>
      <button
        type="button"
        @click="onClickPreviousPage"
        :disabled="isInFirstPage"
        class="block border-r border-gray-300 px-3 py-2 rounded-l disabled:opacity-50"
      >
      &lt;
      </button>
    </li>
    <li v-for="page in pages" :key="page.name">
      <button
        @click="onClickPage(page.name)"
        class="block border-r px-3 py-2"
        :class="{ 'bg-gray-700 text-white': isPageActive(page.name) }"
      >
        {{ page.name }}
      </button>
    </li>
    <li>
      <button
        type="button"
        @click="onClickNextPage"
        :disabled="isInLastPage"
        class="block px-3 py-2 rounded-r disabled:opacity-50"
      >
        &gt;
      </button>
    </li>
    <li>
      <button
        type="button"
        @click="onClickLastPage"
        :disabled="isInLastPage"
        class="block px-3 py-2 border-l disabled:opacity-50"
      >
        &gt;&gt;
      </button>
    </li>
    <li v-if="count" class="px-5 py-2 rounded-r border-l text-gray-600 whitespace-no-wrap">{{ meta }}</li>
  </ul>
</template>

<script>
export default {
  name: 'paginator',
  props: {
    count: {
      required: true,
      type: Number,
      default: 0
    },
    pageLength: {
      required: true,
      type: Number,
      default: 0
    },
    limit: {
      required: false,
      type: Number,
      default: 10
    },
    visiblePage: {
      required: false,
      type: Number,
      default: 5
    }
  },
  data () {
    return {
      pageNumber: 1
    }
  },

  watch: {
    pageNumber (value) {
      this.$emit('pageChanged', { page: value, limit: this.limit })
    }
  },

  computed: {
    meta () {
      const begin = ((this.pageNumber - 1) * this.$props.limit) + 1
      const end = (begin + this.$props.pageLength) - 1
      return begin === end
        ? `${begin} of ${this.$props.count }.`
        : `${begin} to ${end} of ${this.$props.count }.`
    },
    startPage() {
      // When on the first page
      if (this.pageNumber === 1) {
        return 1;
      }
      // When on the last page
      if (this.pageNumber === this.limit) {
        return this.limit - this.visiblePage;
      }
      // When in between
      return this.pageNumber - 1;
    },
    pages() {
      const range = [];

      for (let i = this.startPage;
        i <= Math.min(this.startPage + this.visiblePage - 1, Math.ceil(this.count/this.limit));
        i+= 1 ) {
        range.push({
          name: i,
          isDisabled: i === this.pageNumber
        });
      }

      return range;
    },
    isInFirstPage() {
      return this.pageNumber === 1;
    },
    isInLastPage() {
      if (!this.count) return true

      return this.pageNumber === Math.ceil(this.count/this.limit)
    },
  },

  methods: {
    onClickFirstPage() {
      this.pageNumber = 1
    },
    onClickPreviousPage() {
      this.pageNumber = this.pageNumber <= 1 ? 1 : (this.pageNumber - 1)
    },
    onClickPage(page) {
      this.pageNumber = page
    },
    onClickNextPage() {
      const lastpage = Math.ceil(this.count/this.limit)
      this.pageNumber = this.pageNumber < lastpage ? this.pageNumber + 1 : lastpage
    },
    onClickLastPage() {
      this.pageNumber = Math.ceil(this.count/this.limit)
    },
    isPageActive(page) {
      return this.pageNumber === page;
    }
  }
}
</script>