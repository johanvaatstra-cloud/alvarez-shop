<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-surface">
    <div class="text-center">
      <h1 class="font-display text-8xl font-light text-border mb-4">404</h1>
      <p class="font-sans text-xl text-body mb-8">{{ t('notFound.title') }}</p>
      <RouterLink to="/" class="btn-primary inline-flex">{{ t('notFound.back_home') }}</RouterLink>
    </div>
  </div>
</template>
