<script setup lang="ts">
import AdminSidebar from './AdminSidebar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <div class="flex-1 bg-surface overflow-auto">
      <main class="p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
