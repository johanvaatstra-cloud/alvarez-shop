<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

const links = computed(() => [
  { to: '/admin/dashboard', label: t('admin.dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/pedidos', label: t('admin.orders'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/admin/clientes', label: t('admin.customers'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/admin/productos', label: t('admin.products'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/admin/facturas', label: t('admin.invoices'), icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/admin/clientes/importar', label: t('admin.import'), icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
])

function saveLang() {
  localStorage.setItem('locale', locale.value)
}
</script>

<template>
  <aside class="w-56 bg-black text-white flex flex-col min-h-screen">
    <div class="p-6 border-b border-white/10">
      <div class="font-display text-lg font-light">Alvarez Admin</div>
    </div>
    <nav class="flex-1 p-4 space-y-1">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
        active-class="text-white bg-white/10"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="link.icon" />
        </svg>
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="p-4 border-t border-white/10 space-y-3">
      <select v-model="locale" @change="saveLang" class="w-full text-xs text-muted bg-transparent border border-white/10 px-2 py-1 cursor-pointer outline-none">
        <option value="es">Español</option>
        <option value="ca">Català</option>
        <option value="en">English</option>
        <option value="nl">Nederlands</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
      </select>
      <RouterLink to="/" class="block text-xs text-muted hover:text-white transition-colors">{{ t('admin.back_to_store') }}</RouterLink>
    </div>
  </aside>
</template>
