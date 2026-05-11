<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useCartStore } from '../../stores/cart'
import { useRouter, RouterLink } from 'vue-router'

const { t, locale } = useI18n()
const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'home' })
}

function saveLang() {
  localStorage.setItem('locale', locale.value)
}
</script>

<template>
  <header class="bg-white border-b border-border sticky top-0 z-40 overflow-visible">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
      <div class="flex items-center justify-between h-20 overflow-visible">
        <!-- Logo — fills header height and overflows ~16px into section below -->
        <RouterLink to="/" class="no-underline flex-shrink-0 relative z-50" style="align-self: flex-end; transform: translateY(16px);">
          <img src="/alvarez-logo.png" alt="Alvarez Catalunya" class="h-24 w-24" />
        </RouterLink>

        <!-- Public nav -->
        <nav class="hidden md:flex items-center gap-8">
          <RouterLink to="/" class="nav-link" active-class="nav-link-active">{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/sobre-nosotros" class="nav-link" active-class="nav-link-active">{{ t('nav.about') }}</RouterLink>
          <RouterLink to="/marcas" class="nav-link" active-class="nav-link-active">{{ t('nav.brands') }}</RouterLink>
          <RouterLink to="/contacto" class="nav-link" active-class="nav-link-active">{{ t('nav.contact') }}</RouterLink>
          <RouterLink v-if="auth.isLoggedIn" to="/tienda/catalogo" class="nav-link" active-class="nav-link-active">{{ t('nav.catalog') }}</RouterLink>
          <RouterLink v-if="auth.isLoggedIn && auth.isAdmin" to="/admin" class="nav-link text-accent">{{ t('nav.admin') }}</RouterLink>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Language selector -->
          <select v-model="locale" @change="saveLang" class="text-xs font-semibold text-muted hover:text-body uppercase bg-transparent cursor-pointer border-none outline-none">
            <option value="es">ES</option>
            <option value="ca">CA</option>
            <option value="en">EN</option>
            <option value="nl">NL</option>
            <option value="de">DE</option>
            <option value="fr">FR</option>
          </select>

          <!-- Cart -->
          <RouterLink v-if="auth.isLoggedIn" to="/tienda/carrito" class="relative p-2 text-body hover:text-accent">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center">
              {{ cart.itemCount }}
            </span>
          </RouterLink>

          <!-- Auth -->
          <template v-if="auth.isLoggedIn">
            <RouterLink to="/tienda/cuenta" class="text-sm text-muted hover:text-body hidden md:block">
              {{ auth.user?.companyName }}
            </RouterLink>
            <button class="btn-ghost" @click="handleLogout">{{ t('nav.logout') }}</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-primary">{{ t('nav.login') }}</RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
