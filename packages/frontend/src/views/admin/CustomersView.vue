<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'

const { t } = useI18n()

const customers = ref<unknown[]>([])
const total = ref(0)
const page = ref(1)
const search = ref('')
const status = ref('')
const loading = ref(false)
const tempPasswordModal = ref<{ id: string; open: boolean }>({ id: '', open: false })
const tempPassword = ref('')

async function fetch() {
  loading.value = true
  const { data } = await adminApi.customers({ page: page.value, search: search.value, status: status.value })
  customers.value = data.customers
  total.value = data.total
  loading.value = false
}

onMounted(fetch)
watch([search, status], () => { page.value = 1; fetch() })

async function toggleActive(id: string, current: boolean) {
  await adminApi.updateCustomer(id, { isActive: !current })
  fetch()
}

async function resend(id: string) {
  await adminApi.resendActivation(id)
  alert(t('admin.resend_activation'))
}

async function setTempPw() {
  if (!tempPassword.value || tempPassword.value.length < 8) { alert('min. 8'); return }
  await adminApi.setTempPassword(tempPasswordModal.value.id, tempPassword.value)
  tempPasswordModal.value.open = false
  tempPassword.value = ''
}

type Customer = { id: string; companyName: string; vatNumber: string; email: string; isActive: boolean; paymentMethod: string; discountPct: number }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-3xl font-light">{{ t('admin.customers') }}</h1>
      <RouterLink to="/admin/clientes/importar">
        <AppButton>{{ t('admin.import') }}</AppButton>
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <input v-model="search" :placeholder="t('admin.search')" class="input-field flex-1" />
      <select v-model="status" class="input-field w-40">
        <option value="">{{ t('admin.all_statuses') }}</option>
        <option value="active">{{ t('admin.customer_detail.active') }}</option>
        <option value="inactive">{{ t('admin.customer_detail.inactive') }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full bg-white border border-border text-sm">
        <thead class="bg-surface border-b border-border">
          <tr>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.company') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.customer_detail.vat_number') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.email') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.payment') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.discount') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.status') }}</th>
            <th class="p-4 font-semibold">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in (customers as Customer[])" :key="c.id" class="border-b border-border hover:bg-surface">
            <td class="p-4">
              <RouterLink :to="`/admin/clientes/${c.id}`" class="font-semibold hover:text-accent">{{ c.companyName }}</RouterLink>
            </td>
            <td class="p-4 text-muted font-mono text-xs">{{ c.vatNumber }}</td>
            <td class="p-4 text-muted">{{ c.email }}</td>
            <td class="p-4">
              <span class="badge" :class="c.paymentMethod === 'ON_ACCOUNT' ? 'badge-dark' : 'badge-surface'">
                {{ c.paymentMethod === 'ON_ACCOUNT' ? t('checkout.on_account', { days: '' }) : t('checkout.online') }}
              </span>
            </td>
            <td class="p-4">
              <span :class="c.discountPct > 0 ? 'text-accent font-semibold' : 'text-muted'">
                {{ c.discountPct ?? 0 }}%
              </span>
            </td>
            <td class="p-4">
              <span class="badge" :class="c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ c.isActive ? t('admin.customer_detail.active') : t('admin.customer_detail.inactive') }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex gap-2 justify-center">
                <button class="text-xs text-muted hover:text-body" @click="toggleActive(c.id, c.isActive)">
                  {{ c.isActive ? t('admin.customer_detail.inactive') : t('admin.customer_detail.active') }}
                </button>
                <button v-if="!c.isActive" class="text-xs text-accent hover:underline" @click="resend(c.id)">
                  {{ t('admin.resend_activation') }}
                </button>
                <button class="text-xs text-muted hover:text-body" @click="tempPasswordModal = { id: c.id, open: true }">
                  pw
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-sm text-muted mt-4">{{ t('admin.total_customers', { n: total }, total) }}</p>

    <!-- Temp password modal -->
    <AppModal :open="tempPasswordModal.open" :title="t('admin.set_temp_password')" @close="tempPasswordModal.open = false">
      <div class="space-y-4">
        <p class="text-sm text-muted">{{ t('auth.must_change') }}</p>
        <input v-model="tempPassword" type="password" placeholder="min. 8" class="input-field" />
        <AppButton @click="setTempPw">{{ t('common.save') }}</AppButton>
      </div>
    </AppModal>
  </div>
</template>
