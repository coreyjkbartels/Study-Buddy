<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  localStorage.setItem('active-tab', 'dashboard')
})
</script>

<template>
  <h1>Welcome To Your Dashboard</h1>
  <p>Wazzzzuuuuuuuppppp!!!!!</p>
</template>
