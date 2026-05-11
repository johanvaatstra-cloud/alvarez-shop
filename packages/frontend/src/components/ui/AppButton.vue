<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm uppercase tracking-wider transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      variant === 'secondary'
        ? 'bg-transparent text-body border border-body px-6 py-3 hover:bg-body hover:text-white'
        : variant === 'ghost'
        ? 'bg-transparent text-muted px-4 py-2 hover:text-body'
        : 'bg-accent text-white px-6 py-3 hover:bg-red-800',
    ]"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>
