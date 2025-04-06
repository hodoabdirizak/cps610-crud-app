<template>
  <VApp>
    <VMain>
      <AdminDashboard />
    </VMain>
  </VApp>
</template>

<script>
import AdminDashboard from './components/AdminDashboard.vue'

export default {
  name: 'App',
  components: {
    AdminDashboard,
  },
}
</script>
