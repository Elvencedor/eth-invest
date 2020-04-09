<template>
  <section class="mx-auto">
    <main>
      <router-view></router-view>
    </main>
  </section>
</template>

<script>
export default {
  name: 'defaultLayout',
  methods:{
    range : function (start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }
  }
}
</script>