<script setup>
  import { ref } from 'vue';
  const msg = ref('hello world!!!');
</script>

<template>
  <h1>{{ msg }}</h1>
</template>

<style scoped>
  .h1 {
    color: #888;
  }
</style>
