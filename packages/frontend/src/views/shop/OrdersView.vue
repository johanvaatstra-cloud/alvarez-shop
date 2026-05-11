<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ordersApi } from '../../api/orders.api'
import type { OrderDto } from '@alvarez/shared'

const { t } = useI18n()
const orders = ref<OrderDto[]>([])
const loading = ref(true)

const statusColors: Record<string, string> = {
  PENDING: 'badge-surface',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  PROCESSING: 'bg-amber-50 text-amber-700 border border-amber-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
}

onMounted(async () => {
  try {
    const { data } = await ordersApi.list()
    orders.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-light mb-8">{{ t('orders.title') }}</h1>
    <div v-if="loading" class="text-muted text-center py-16">{{ t('common.loading') }}</div>
    <div v-else-if="orders.length === 0" class="text-muted text-center py-16">{{ t('orders.empty') }}</div>
    <div v-else class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white border border-border p-4 flex flex-wrap items-center gap-4 justify-between"
      >
        <div>
          <p class="font-semibold text-sm">{{ order.orderNumber }}</p>
          <p class="text-xs text-muted">{{ new Date(order.createdAt).toLocaleDateString('es-ES') }}</p>
        </div>
        <span :class="['badge text-xs px-2 py-0.5', statusColors[order.status]]">
          {{ t(`orders.statuses.${order.status}`) }}
        </span>
        <div class="text-right">
          <p class="font-semibold">€{{ order.totalAmount.toFixed(2) }}</p>
          <p class="text-xs text-muted">{{ t('orders.item_count', { n: order.items.length }, order.items.length) }}</p>
        </div>
        <RouterLink :to="`/tienda/pedidos/${order.id}`" class="text-sm text-accent hover:underline">
          {{ t('orders.details') }} →
        </RouterLink>
      </div>
    </div>
  </div>
</template>
