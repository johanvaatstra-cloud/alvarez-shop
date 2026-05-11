<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useCartStore } from '../../stores/cart'
import { ordersApi } from '../../api/orders.api'
import { customersApi } from '../../api/customers.api'
import type { AddressDto } from '@alvarez/shared'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const addresses = ref<AddressDto[]>([])
const selectedAddressId = ref<string | undefined>()
const notes = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  const { data } = await customersApi.me()
  addresses.value = data.addresses ?? []
  const def = addresses.value.find((a: AddressDto) => a.isDefault) ?? addresses.value[0]
  if (def) selectedAddressId.value = def.id
})

const isOnAccount = computed(() => auth.user?.paymentMethod === 'ON_ACCOUNT')
const creditAvailable = computed(() => {
  if (!auth.user?.creditLimit) return null
  return auth.user.creditLimit - auth.user.currentBalance
})
const creditExceeded = computed(() => {
  if (!auth.user?.creditLimit) return false
  return cart.total > (creditAvailable.value ?? Infinity)
})

async function placeOrder() {
  if (creditExceeded.value) return
  error.value = ''
  loading.value = true
  try {
    const { data } = await ordersApi.create({
      addressId: selectedAddressId.value,
      items: cart.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      notes: notes.value || undefined,
    })

    cart.clear()
    success.value = true
    setTimeout(() => router.push('/tienda/pedidos'), 2000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } }
    error.value = e.response?.data?.error ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="font-display text-3xl font-light mb-8">{{ t('checkout.title') }}</h1>

    <div v-if="success" class="bg-green-50 border border-green-200 p-8 text-center">
      <div class="text-4xl mb-4">✓</div>
      <h2 class="font-display text-2xl font-light mb-2">{{ t('checkout.success') }}</h2>
      <p class="text-muted">{{ t('checkout.success_sub') }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Credit warning -->
      <div v-if="isOnAccount && auth.user?.creditLimit" class="bg-surface border border-border p-4">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-muted">{{ t('checkout.current_balance') }}</span>
          <span class="font-semibold">€{{ auth.user.currentBalance.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm mb-1">
          <span class="text-muted">{{ t('checkout.credit_limit') }}</span>
          <span class="font-semibold">€{{ auth.user.creditLimit?.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted">{{ t('checkout.available') }}</span>
          <span :class="creditExceeded ? 'text-red-600 font-semibold' : 'font-semibold'">€{{ creditAvailable?.toFixed(2) }}</span>
        </div>
        <div v-if="creditExceeded" class="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 p-3">
          {{ t('checkout.credit_exceeded') }}
        </div>
      </div>

      <!-- Delivery address -->
      <div class="card">
        <h2 class="font-semibold mb-4">{{ t('checkout.delivery') }}</h2>
        <div class="space-y-2">
          <label
            v-for="addr in addresses"
            :key="addr.id"
            class="flex items-start gap-3 p-3 border cursor-pointer"
            :class="selectedAddressId === addr.id ? 'border-accent' : 'border-border'"
          >
            <input v-model="selectedAddressId" type="radio" :value="addr.id" class="mt-1 accent-accent" />
            <div class="text-sm">
              <p v-if="addr.label" class="font-semibold">{{ addr.label }}</p>
              <p class="text-muted">{{ addr.street }}, {{ addr.postalCode }} {{ addr.city }}</p>
              <p class="text-muted">{{ addr.province }}, {{ addr.country }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Notes -->
      <div class="card">
        <label class="text-sm font-semibold block mb-2">{{ t('checkout.notes') }}</label>
        <textarea v-model="notes" rows="3" :placeholder="t('checkout.notes_placeholder')" class="input-field resize-none" />
      </div>

      <!-- Payment method -->
      <div class="card">
        <h2 class="font-semibold mb-3">{{ t('checkout.payment_method') }}</h2>
        <p v-if="isOnAccount" class="text-sm text-body">
          {{ t('checkout.on_account', { days: auth.user?.paymentTermDays ?? 30 }) }}
        </p>
        <p v-else class="text-sm text-body">{{ t('checkout.online') }}</p>
      </div>

      <!-- Order summary -->
      <div class="card">
        <h2 class="font-semibold mb-4">{{ t('checkout.summary') }}</h2>
        <div class="space-y-1 text-sm mb-4">
          <div v-for="item in cart.items" :key="item.product.id" class="flex justify-between text-muted">
            <span>{{ item.product.name }} × {{ item.quantity }}</span>
            <span>€{{ ((item.product.pricePerUnit ?? item.product.pricePerKg ?? 0) * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="border-t border-border pt-3 space-y-1 text-sm">
          <div class="flex justify-between text-muted"><span>{{ t('cart.subtotal') }}</span><span>€{{ cart.subtotal.toFixed(2) }}</span></div>
          <div v-if="cart.discountPct > 0" class="flex justify-between text-accent font-medium">
            <span>{{ t('checkout.discount', { pct: cart.discountPct }) }}</span>
            <span>-€{{ cart.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-muted"><span>{{ t('cart.vat') }}</span><span>€{{ cart.vatAmount.toFixed(2) }}</span></div>
          <div class="flex justify-between font-semibold text-base pt-1"><span>{{ t('cart.total') }}</span><span>€{{ cart.total.toFixed(2) }}</span></div>
        </div>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{{ error }}</div>

      <AppButton
        :loading="loading"
        :disabled="creditExceeded || cart.items.length === 0"
        class="w-full justify-center"
        @click="placeOrder"
      >
        {{ isOnAccount ? t('checkout.confirm') : t('checkout.confirm_online') }}
      </AppButton>
    </div>
  </div>
</template>
