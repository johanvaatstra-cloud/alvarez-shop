<script setup lang="ts">
defineProps<{
  variant?: 'accent' | 'dark' | 'surface' | 'fi' | 'sf' | 'fd' | 'sp'
}>()
</script>

<template>
  <span
    :class="[
      'inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5',
      variant === 'accent' ? 'bg-accent text-white' :
      variant === 'dark' ? 'bg-body text-white' :
      variant === 'fi' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
      variant === 'sf' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
      variant === 'fd' ? 'bg-green-50 text-green-700 border border-green-200' :
      variant === 'sp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
      'bg-surface text-muted border border-border'
    ]"
  >
    <slot />
  </span>
</template>
