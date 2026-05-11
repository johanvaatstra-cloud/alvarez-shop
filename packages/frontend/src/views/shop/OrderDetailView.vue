<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ordersApi } from '../../api/orders.api'
import type { OrderDto } from '@alvarez/shared'

const { t } = useI18n()
const route = useRoute()
const order = ref<OrderDto | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await ordersApi.get(route.params.id as string)
    order.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl">
    <RouterLink to="/tienda/pedidos" class="text-sm text-muted hover:text-body mb-6 block">{{ t('orders.back') }}</RouterLink>
    <div v-if="loading" class="text-muted">{{ t('common.loading') }}</div>
    <div v-else-if="!order" class="text-muted">{{ t('orders.not_found') }}</div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-display text-2xl font-light">{{ order.orderNumber }}</h1>
        <span class="badge badge-surface">{{ t(`orders.statuses.${order.status}`) }}</span>
      </div>
      <p class="text-sm text-muted mb-8">{{ new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' }) }}</p>

      <div class="card mb-6">
        <h2 class="font-semibold mb-4">{{ t('orders.items') }}</h2>
        <div class="space-y-3">
          <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
            <div>
              <p class="font-semibold">{{ (item as { productName?: string }).productName ?? item.productId }}</p>
              <p class="text-muted text-xs">{{ t('orders.quantity') }}: {{ item.quantity }}</p>
            </div>
            <span>€{{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="border-t border-border mt-4 pt-4 space-y-1 text-sm">
          <div class="flex justify-between text-muted"><span>{{ t('cart.subtotal') }}</span><span>€{{ (order.totalAmount - order.vatAmount).toFixed(2) }}</span></div>
          <div class="flex justify-between text-muted"><span>{{ t('cart.vat') }}</span><span>€{{ order.vatAmount.toFixed(2) }}</span></div>
          <div class="flex justify-between font-semibold"><span>{{ t('cart.total') }}</span><span>€{{ order.totalAmount.toFixed(2) }}</span></div>
        </div>
      </div>

      <div v-if="order.deliveryAddress" class="card">
        <h2 class="font-semibold mb-3">{{ t('orders.delivery_address') }}</h2>
        <address class="not-italic text-sm text-muted leading-relaxed">
          {{ order.deliveryAddress.street }}<br />
          {{ order.deliveryAddress.postalCode }} {{ order.deliveryAddress.city }}<br />
          {{ order.deliveryAddress.province }}, {{ order.deliveryAddress.country }}
        </address>
      </div>
    </div>
  </div>
</template>
