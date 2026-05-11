<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'

const { t } = useI18n()
const route = useRoute()
const customer = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const tempPwModal = ref(false)
const tempPassword = ref('')
const saving = ref(false)

const editingDiscount = ref(false)
const discountInput = ref(0)
const savingDiscount = ref(false)

onMounted(async () => {
  const { data } = await adminApi.customer(route.params.id as string)
  customer.value = data
  discountInput.value = (data.discountPct as number) ?? 0
  loading.value = false
})

async function toggleActive() {
  if (!customer.value) return
  await adminApi.updateCustomer(customer.value.id as string, { isActive: !customer.value.isActive })
  customer.value.isActive = !customer.value.isActive
}

async function resend() {
  if (!customer.value) return
  await adminApi.resendActivation(customer.value.id as string)
  alert(t('admin.resend_activation'))
}

async function setTempPw() {
  if (!customer.value || !tempPassword.value || tempPassword.value.length < 8) return
  saving.value = true
  await adminApi.setTempPassword(customer.value.id as string, tempPassword.value)
  saving.value = false
  tempPwModal.value = false
  tempPassword.value = ''
}

async function saveDiscount() {
  if (!customer.value) return
  savingDiscount.value = true
  await adminApi.updateCustomer(customer.value.id as string, { discountPct: discountInput.value })
  customer.value.discountPct = discountInput.value
  editingDiscount.value = false
  savingDiscount.value = false
}

function startEditDiscount() {
  discountInput.value = (customer.value?.discountPct as number) ?? 0
  editingDiscount.value = true
}
</script>

<template>
  <div class="max-w-3xl">
    <RouterLink to="/admin/clientes" class="text-sm text-muted hover:text-body mb-6 block">{{ t('admin.customer_detail.back') }}</RouterLink>
    <div v-if="loading" class="text-muted">{{ t('admin.loading') }}</div>
    <div v-else-if="customer">
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-display text-3xl font-light">{{ customer.companyName as string }}</h1>
        <div class="flex gap-2">
          <AppButton variant="secondary" @click="toggleActive">
            {{ customer.isActive ? t('admin.customer_detail.inactive') : t('admin.customer_detail.active') }}
          </AppButton>
          <AppButton v-if="!customer.isActive" @click="resend">{{ t('admin.resend_activation') }}</AppButton>
          <AppButton variant="secondary" @click="tempPwModal = true">{{ t('admin.set_temp_password') }}</AppButton>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="font-semibold mb-4">{{ t('admin.customer_detail.company_info') }}</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('admin.customer_detail.vat_number') }}</dt><dd class="font-mono">{{ customer.vatNumber as string }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('account.email') }}</dt><dd>{{ customer.email as string }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('account.contact') }}</dt><dd>{{ customer.contactName as string }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('account.phone') }}</dt><dd>{{ (customer.phone as string) ?? '—' }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('orders.status') }}</dt>
              <dd><span :class="['badge', customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ customer.isActive ? t('admin.customer_detail.active') : t('admin.customer_detail.inactive') }}</span></dd>
            </div>
          </dl>
        </div>

        <div class="card">
          <h2 class="font-semibold mb-4">{{ t('admin.customer_detail.commercial_conditions') }}</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('admin.customer_detail.payment_method') }}</dt><dd>{{ customer.paymentMethod as string }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('admin.customer_detail.credit_limit') }}</dt><dd>{{ customer.creditLimit ? `€${(customer.creditLimit as number).toFixed(2)}` : '—' }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('admin.customer_detail.payment_days') }}</dt><dd>{{ (customer.paymentTermDays as number | null) ?? '—' }}</dd></div>
            <div class="flex gap-4"><dt class="text-muted w-32">{{ t('account.balance') }}</dt><dd class="font-semibold">€{{ (customer.currentBalance as number).toFixed(2) }}</dd></div>

            <!-- Discount — editable -->
            <div class="flex gap-4 items-center pt-2 border-t border-border mt-2">
              <dt class="text-muted w-32 font-semibold">{{ t('admin.customer_detail.discount') }}</dt>
              <dd class="flex items-center gap-2">
                <template v-if="!editingDiscount">
                  <span class="font-semibold" :class="(customer.discountPct as number) > 0 ? 'text-accent' : ''">
                    {{ customer.discountPct as number }}%
                  </span>
                  <button class="text-xs text-muted hover:text-body underline" @click="startEditDiscount">{{ t('common.edit') }}</button>
                </template>
                <template v-else>
                  <input
                    v-model.number="discountInput"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    class="input-field w-20 py-1 text-sm"
                  />
                  <span class="text-sm text-muted">%</span>
                  <AppButton :loading="savingDiscount" class="py-1 px-3 text-xs" @click="saveDiscount">{{ t('common.save') }}</AppButton>
                  <button class="text-xs text-muted hover:text-body" @click="editingDiscount = false">{{ t('common.cancel') }}</button>
                </template>
              </dd>
            </div>
          </dl>
          <p class="text-xs text-muted mt-4 p-3 bg-surface border border-border">
            {{ t('admin.customer_detail.payment_note') }}
          </p>
        </div>
      </div>
    </div>

    <AppModal :open="tempPwModal" :title="t('admin.set_temp_password')" @close="tempPwModal = false">
      <div class="space-y-4">
        <p class="text-sm text-muted">{{ t('auth.must_change') }}</p>
        <input v-model="tempPassword" type="password" placeholder="min. 8" class="input-field" />
        <AppButton :loading="saving" @click="setTempPw">{{ t('common.save') }}</AppButton>
      </div>
    </AppModal>
  </div>
</template>
