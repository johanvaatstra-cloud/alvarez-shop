<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <AppHeader />
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
