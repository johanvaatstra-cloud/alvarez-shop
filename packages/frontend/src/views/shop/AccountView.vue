<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { customersApi } from '../../api/customers.api'
import { useAuthStore } from '../../stores/auth'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const auth = useAuthStore()
const profile = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const saving = ref(false)
const contactName = ref('')
const phone = ref('')

onMounted(async () => {
  const { data } = await customersApi.me()
  profile.value = data
  contactName.value = data.contactName
  phone.value = data.phone ?? ''
  loading.value = false
})

async function save() {
  saving.value = true
  await customersApi.update({ contactName: contactName.value, phone: phone.value })
  await auth.refreshUser()
  saving.value = false
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="font-display text-3xl font-light mb-8">{{ t('account.title') }}</h1>

    <div v-if="loading" class="text-muted">{{ t('common.loading') }}</div>
    <div v-else-if="profile" class="space-y-6">
      <!-- Company info (read-only) -->
      <div class="card">
        <h2 class="font-semibold mb-4">{{ t('account.company') }}</h2>
        <div class="space-y-2 text-sm">
          <div class="flex gap-4">
            <span class="text-muted w-32">{{ t('account.company') }}</span>
            <span class="font-semibold">{{ profile.companyName as string }}</span>
          </div>
          <div class="flex gap-4">
            <span class="text-muted w-32">{{ t('account.vat') }}</span>
            <span>{{ profile.vatNumber as string }}</span>
          </div>
          <div class="flex gap-4">
            <span class="text-muted w-32">{{ t('account.email') }}</span>
            <span>{{ profile.email as string }}</span>
          </div>
          <div class="flex gap-4">
            <span class="text-muted w-32">{{ t('account.payment_method') }}</span>
            <span>{{ profile.paymentMethod === 'ON_ACCOUNT' ? t('checkout.on_account', { days: '' }) : t('checkout.online') }}</span>
          </div>
          <template v-if="profile.creditLimit">
            <div class="flex gap-4">
              <span class="text-muted w-32">{{ t('account.credit_limit') }}</span>
              <span>€{{ (profile.creditLimit as number).toFixed(2) }}</span>
            </div>
            <div class="flex gap-4">
              <span class="text-muted w-32">{{ t('account.balance') }}</span>
              <span :class="(profile.currentBalance as number) > 0 ? 'text-amber-600' : ''">
                €{{ (profile.currentBalance as number).toFixed(2) }}
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- Editable contact info -->
      <div class="card">
        <h2 class="font-semibold mb-4">{{ t('account.contact') }}</h2>
        <div class="space-y-4">
          <AppInput v-model="contactName" :label="t('account.contact')" />
          <AppInput v-model="phone" :label="t('account.phone')" type="tel" />
          <AppButton :loading="saving" @click="save">{{ t('account.save') }}</AppButton>
        </div>
      </div>

      <!-- Addresses -->
      <div class="card">
        <h2 class="font-semibold mb-4">{{ t('account.addresses') }}</h2>
        <div class="space-y-3">
          <div
            v-for="addr in (profile.addresses as unknown[])"
            :key="(addr as { id: string }).id"
            class="border border-border p-3 text-sm"
          >
            <p v-if="(addr as { label?: string }).label" class="font-semibold">{{ (addr as { label: string }).label }}</p>
            <p class="text-muted">{{ (addr as { street: string }).street }}, {{ (addr as { postalCode: string }).postalCode }} {{ (addr as { city: string }).city }}</p>
            <p class="text-muted">{{ (addr as { province: string }).province }}</p>
            <span v-if="(addr as { isDefault: boolean }).isDefault" class="badge badge-accent mt-2">{{ t('account.default_address') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
