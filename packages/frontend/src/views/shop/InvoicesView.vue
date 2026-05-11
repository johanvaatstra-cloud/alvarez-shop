<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { invoicesApi } from '../../api/orders.api'
import type { InvoiceDto } from '@alvarez/shared'

const { t } = useI18n()
const invoices = ref<InvoiceDto[]>([])
const loading = ref(true)

const statusColors: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border border-amber-200',
  PAID: 'bg-green-50 text-green-700 border border-green-200',
  OVERDUE: 'bg-red-50 text-red-700 border border-red-200',
  DISPUTED: 'bg-orange-50 text-orange-700 border border-orange-200',
  CANCELLED: 'badge-surface',
}

onMounted(async () => {
  try {
    const { data } = await invoicesApi.list()
    invoices.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-light mb-8">{{ t('invoices.title') }}</h1>
    <div v-if="loading" class="text-muted text-center py-16">{{ t('common.loading') }}</div>
    <div v-else-if="invoices.length === 0" class="text-muted text-center py-16">{{ t('invoices.empty') }}</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white border border-border text-sm">
        <thead class="bg-surface border-b border-border">
          <tr>
            <th class="text-left p-4 font-semibold">{{ t('invoices.invoice_number') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('invoices.order') }}</th>
            <th class="text-right p-4 font-semibold">{{ t('invoices.amount') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('invoices.due_date') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('invoices.status') }}</th>
            <th class="p-4"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id" class="border-b border-border hover:bg-surface">
            <td class="p-4 font-semibold">{{ inv.invoiceNumber }}</td>
            <td class="p-4 text-muted">{{ (inv as { order?: { orderNumber?: string } }).order?.orderNumber ?? inv.orderId }}</td>
            <td class="p-4 text-right font-semibold">€{{ inv.amount.toFixed(2) }}</td>
            <td class="p-4 text-muted">{{ new Date(inv.dueDate).toLocaleDateString('es-ES') }}</td>
            <td class="p-4"><span :class="['badge', statusColors[inv.status]]">{{ t(`invoices.statuses.${inv.status}`) }}</span></td>
            <td class="p-4">
              <a v-if="inv.pdfUrl" :href="inv.pdfUrl" target="_blank" class="text-accent text-xs hover:underline">PDF</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
