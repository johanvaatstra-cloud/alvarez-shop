<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'

const { t } = useI18n()

const stats = ref<{
  pendingOrders: number
  todayRevenue: number
  openInvoices: number
  lowStockProducts: number
  recentOrders: Array<{ id: string; orderNumber: string; totalAmount: number; status: string; customer: { companyName: string } }>
} | null>(null)

onMounted(async () => {
  const { data } = await adminApi.dashboard()
  stats.value = data
})

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-light mb-8">{{ t('admin.dashboard') }}</h1>

    <div v-if="!stats" class="text-muted">{{ t('admin.loading') }}</div>
    <div v-else>
      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div class="card text-center">
          <p class="text-4xl font-display font-light text-accent mb-1">{{ stats.pendingOrders }}</p>
          <p class="text-sm text-muted">{{ t('admin.pending_orders') }}</p>
        </div>
        <div class="card text-center">
          <p class="text-4xl font-display font-light mb-1">€{{ stats.todayRevenue.toFixed(0) }}</p>
          <p class="text-sm text-muted">{{ t('admin.today_revenue') }}</p>
        </div>
        <div class="card text-center">
          <p class="text-4xl font-display font-light text-amber-600 mb-1">{{ stats.openInvoices }}</p>
          <p class="text-sm text-muted">{{ t('admin.open_invoices') }}</p>
        </div>
        <div class="card text-center">
          <p class="text-4xl font-display font-light text-red-600 mb-1">{{ stats.lowStockProducts }}</p>
          <p class="text-sm text-muted">{{ t('admin.low_stock') }}</p>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">{{ t('admin.recent_orders') }}</h2>
          <RouterLink to="/admin/pedidos" class="text-sm text-accent hover:underline">{{ t('admin.view_all') }}</RouterLink>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-surface">
            <tr>
              <th class="text-left p-3 font-semibold">{{ t('orders.order_number') }}</th>
              <th class="text-left p-3 font-semibold">{{ t('admin.table.client') }}</th>
              <th class="text-right p-3 font-semibold">{{ t('orders.total') }}</th>
              <th class="text-left p-3 font-semibold">{{ t('orders.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in stats.recentOrders" :key="order.id" class="border-t border-border">
              <td class="p-3 font-semibold">{{ order.orderNumber }}</td>
              <td class="p-3 text-muted">{{ order.customer.companyName }}</td>
              <td class="p-3 text-right">€{{ order.totalAmount.toFixed(2) }}</td>
              <td class="p-3">
                <span :class="['badge text-xs', statusColors[order.status]]">{{ t(`orders.statuses.${order.status}`) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
