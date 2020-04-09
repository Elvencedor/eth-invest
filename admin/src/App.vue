<template>
  <div id="app" class="bg-gray-900 min-h-screen overflow-hidden">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  methods:{
    range : function (start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
   }
  }
}
</script>
