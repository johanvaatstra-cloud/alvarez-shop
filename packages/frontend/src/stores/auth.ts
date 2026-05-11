import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth.api'

interface UserProfile {
  id: string
  email: string
  companyName: string
  contactName: string
  isAdmin: boolean
  mustChangePassword: boolean
  paymentMethod: 'ONLINE' | 'ON_ACCOUNT'
  creditLimit: number | null
  currentBalance: number
  discountPct: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)
  const mustChangePassword = computed(() => user.value?.mustChangePassword ?? false)

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password)
    user.value = data.customer
  }

  async function logout() {
    await authApi.logout().catch(() => {})
    user.value = null
  }

  async function tryRefresh() {
    if (user.value) return
    loading.value = true
    try {
      const { data } = await authApi.me()
      user.value = data
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function refreshUser() {
    const { data } = await authApi.me()
    user.value = data
  }

  return { user, loading, isLoggedIn, isAdmin, mustChangePassword, login, logout, tryRefresh, refreshUser }
})
