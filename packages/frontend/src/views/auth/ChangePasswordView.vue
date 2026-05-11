<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../stores/auth'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const error = ref('')
const loading = ref(false)

async function change() {
  error.value = ''
  if (newPassword.value.length < 8) { error.value = t('auth.password_min_length'); return }
  loading.value = true
  try {
    await authApi.changePassword(currentPassword.value, newPassword.value)
    await auth.refreshUser()
    router.push('/tienda/catalogo')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } }
    error.value = e.response?.data?.error ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-8">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="font-display text-2xl font-light">Alvarez Catalunya</div>
        <div class="w-8 h-0.5 bg-accent mx-auto mt-4" />
      </div>

      <h2 class="font-display text-2xl font-light mb-2">{{ t('auth.change_password_title') }}</h2>
      <div class="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-6">
        {{ t('auth.must_change') }}
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{{ error }}</div>

      <form class="space-y-4" @submit.prevent="change">
        <AppInput v-model="currentPassword" :label="t('auth.current_password')" type="password" required />
        <AppInput v-model="newPassword" :label="t('auth.new_password')" type="password" required />
        <AppButton type="submit" :loading="loading" class="w-full justify-center mt-6">{{ t('auth.change_btn') }}</AppButton>
      </form>
    </div>
  </div>
</template>
