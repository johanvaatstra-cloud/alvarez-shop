<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()

const orders = ref<unknown[]>([])
const total = ref(0)
const page = ref(1)
const status = ref('')
const search = ref('')
const loading = ref(false)

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800', SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
}

async function fetch() {
  loading.value = true
  const { data } = await adminApi.adminOrders({ page: page.value, status: status.value, search: search.value })
  orders.value = data.orders
  total.value = data.total
  loading.value = false
}

onMounted(fetch)
watch([status, search], () => { page.value = 1; fetch() })

async function updateStatus(id: string, s: string) {
  await adminApi.updateOrderStatus(id, s)
  fetch()
}

type Order = { id: string; orderNumber: string; customer: { companyName: string }; totalAmount: number; status: string; createdAt: string }
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-light mb-6">{{ t('admin.orders') }}</h1>

    <div class="flex gap-4 mb-6">
      <input v-model="search" :placeholder="t('admin.search')" class="input-field flex-1" />
      <select v-model="status" class="input-field w-48">
        <option value="">{{ t('admin.all_statuses') }}</option>
        <option v-for="s in ORDER_STATUSES" :key="s" :value="s">{{ t(`orders.statuses.${s}`) }}</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full bg-white border border-border text-sm">
        <thead class="bg-surface border-b border-border">
          <tr>
            <th class="text-left p-4 font-semibold">{{ t('orders.order_number') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.client') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.date') }}</th>
            <th class="text-right p-4 font-semibold">{{ t('orders.total') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('orders.status') }}</th>
            <th class="p-4 font-semibold">{{ t('orders.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in (orders as Order[])" :key="o.id" class="border-b border-border hover:bg-surface">
            <td class="p-4 font-semibold">{{ o.orderNumber }}</td>
            <td class="p-4 text-muted">{{ o.customer.companyName }}</td>
            <td class="p-4 text-muted">{{ new Date(o.createdAt).toLocaleDateString() }}</td>
            <td class="p-4 text-right font-semibold">€{{ o.totalAmount.toFixed(2) }}</td>
            <td class="p-4"><span :class="['badge text-xs', statusColors[o.status]]">{{ t(`orders.statuses.${o.status}`) }}</span></td>
            <td class="p-4">
              <select
                :value="o.status"
                class="text-xs border border-border px-2 py-1 focus:outline-none focus:border-accent"
                @change="updateStatus(o.id, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="s in ORDER_STATUSES" :key="s" :value="s">{{ t(`orders.statuses.${s}`) }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-sm text-muted mt-4">{{ t('admin.total_orders', { n: total }, total) }}</p>
  </div>
</template>
