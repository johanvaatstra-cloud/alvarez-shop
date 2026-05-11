<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect as string | undefined
    router.push(redirect ?? '/tienda/catalogo')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } }
    error.value = e.response?.data?.error ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex">
    <!-- Left panel - brand -->
    <div class="hidden lg:flex lg:w-1/2 bg-zinc-800 text-white flex-col items-center justify-center p-16">
      <RouterLink to="/">
        <img src="/alvarez-logo.png" alt="Alvarez Catalunya" class="h-24 w-24 mb-8" />
      </RouterLink>
      <div class="text-center">
        <div class="w-12 h-0.5 bg-accent mx-auto mb-6" />
        <p class="text-zinc-400 text-sm leading-relaxed max-w-xs">
          {{ t('auth.tagline') }}
        </p>
      </div>
    </div>

    <!-- Right panel - form -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-sm">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="font-display text-2xl font-light">Alvarez Catalunya</div>
        </div>

        <h2 class="font-display text-2xl font-light mb-2">{{ t('auth.login_title') }}</h2>
        <div class="w-8 h-0.5 bg-accent mb-8" />

        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {{ error }}
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <AppInput
            v-model="email"
            :label="t('auth.email')"
            type="email"
            required
            autocomplete="email"
          />
          <AppInput
            v-model="password"
            :label="t('auth.password')"
            type="password"
            required
            autocomplete="current-password"
          />
          <AppButton type="submit" :loading="loading" class="w-full justify-center mt-6">
            {{ t('auth.login_btn') }}
          </AppButton>
        </form>

        <p class="mt-8 text-xs text-muted text-center">
          {{ t('auth.no_account') }} <RouterLink to="/contacto" class="text-accent hover:underline">{{ t('auth.request_access') }}</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
