<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()

const invoices = ref<unknown[]>([])
const total = ref(0)
const page = ref(1)
const status = ref('')
const loading = ref(false)

const INVOICE_STATUSES = ['OPEN', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED']
const statusColors: Record<string, string> = { OPEN: 'bg-amber-100 text-amber-800', PAID: 'bg-green-100 text-green-800', OVERDUE: 'bg-red-100 text-red-800', DISPUTED: 'bg-orange-100 text-orange-800', CANCELLED: 'badge-surface' }

async function fetch() {
  loading.value = true
  const { data } = await adminApi.adminInvoices({ page: page.value, status: status.value })
  invoices.value = data.invoices
  total.value = data.total
  loading.value = false
}

onMounted(fetch)
watch(status, () => { page.value = 1; fetch() })

async function markPaid(id: string) {
  if (!confirm(t('admin.mark_paid') + '?')) return
  await adminApi.markInvoicePaid(id)
  fetch()
}

type Invoice = { id: string; invoiceNumber: string; customer: { companyName: string }; order: { orderNumber: string }; amount: number; dueDate: string; status: string }
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-light mb-6">{{ t('admin.invoices') }}</h1>

    <select v-model="status" class="input-field w-48 mb-6">
      <option value="">{{ t('admin.all_statuses') }}</option>
      <option v-for="s in INVOICE_STATUSES" :key="s" :value="s">{{ t(`invoices.statuses.${s}`) }}</option>
    </select>

    <div class="overflow-x-auto">
      <table class="w-full bg-white border border-border text-sm">
        <thead class="bg-surface border-b border-border">
          <tr>
            <th class="text-left p-4 font-semibold">{{ t('invoices.invoice_number') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.client') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.order') }}</th>
            <th class="text-right p-4 font-semibold">{{ t('invoices.amount') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('invoices.due_date') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('invoices.status') }}</th>
            <th class="p-4"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in (invoices as Invoice[])" :key="inv.id" class="border-b border-border hover:bg-surface">
            <td class="p-4 font-semibold">{{ inv.invoiceNumber }}</td>
            <td class="p-4 text-muted">{{ inv.customer.companyName }}</td>
            <td class="p-4 text-muted">{{ inv.order.orderNumber }}</td>
            <td class="p-4 text-right font-semibold">€{{ inv.amount.toFixed(2) }}</td>
            <td class="p-4 text-muted" :class="inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : ''">
              {{ new Date(inv.dueDate).toLocaleDateString() }}
            </td>
            <td class="p-4"><span :class="['badge text-xs', statusColors[inv.status]]">{{ t(`invoices.statuses.${inv.status}`) }}</span></td>
            <td class="p-4">
              <button v-if="['OPEN', 'OVERDUE'].includes(inv.status)" class="text-xs text-accent hover:underline" @click="markPaid(inv.id)">
                {{ t('admin.mark_paid') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-sm text-muted mt-4">{{ t('admin.total_invoices', { n: total }, total) }}</p>
  </div>
</template>
