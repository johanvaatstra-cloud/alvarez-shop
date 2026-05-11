<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authApi } from '../../api/auth.api'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const token = route.params.token as string

const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)
const done = ref(false)

async function activate() {
  error.value = ''
  if (password.value.length < 8) { error.value = t('auth.password_min_length'); return }
  if (password.value !== confirm.value) { error.value = t('auth.passwords_mismatch'); return }
  loading.value = true
  try {
    await authApi.activate(token, password.value)
    done.value = true
    setTimeout(() => router.push({ name: 'login' }), 2000)
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

      <div v-if="done" class="text-center py-12">
        <div class="text-5xl mb-4">✓</div>
        <h2 class="font-display text-2xl font-light mb-2">{{ t('auth.account_activated') }}</h2>
        <p class="text-muted text-sm">{{ t('auth.redirecting') }}</p>
      </div>

      <template v-else>
        <h2 class="font-display text-2xl font-light mb-2">{{ t('auth.activate_title') }}</h2>
        <p class="text-muted text-sm mb-8">{{ t('auth.activate_subtitle') }}</p>

        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{{ error }}</div>

        <form class="space-y-4" @submit.prevent="activate">
          <AppInput v-model="password" :label="t('auth.new_password')" type="password" required />
          <AppInput v-model="confirm" :label="t('auth.confirm_password')" type="password" required />
          <AppButton type="submit" :loading="loading" class="w-full justify-center mt-6">{{ t('auth.activate_btn') }}</AppButton>
        </form>
      </template>
    </div>
  </div>
</template>
