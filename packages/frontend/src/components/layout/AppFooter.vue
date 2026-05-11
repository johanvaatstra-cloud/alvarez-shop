<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <footer class="bg-zinc-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Brand -->
        <div>
          <img src="/alvarez-logo.png" alt="Alvarez Catalunya" class="h-24 w-24 mb-4" />
          <p class="text-gray-400 text-sm leading-relaxed">{{ t('footer.description') }}</p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{{ t('footer.company_heading') }}</h3>
          <ul class="space-y-2">
            <li><RouterLink to="/sobre-nosotros" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.about') }}</RouterLink></li>
            <li><RouterLink to="/marcas" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.brands') }}</RouterLink></li>
            <li><RouterLink to="/contacto" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.contact') }}</RouterLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{{ t('footer.contact_heading') }}</h3>
          <address class="not-italic text-sm text-gray-400 space-y-1 leading-relaxed">
            <p>Calle del mas de l'Abad - Nave 133</p>
            <p>CP 43480 · Vila-Seca de Solzina</p>
            <p>Tarragona, España</p>
            <p class="mt-3">
              <a href="tel:+34977394499" class="hover:text-white transition-colors">T. 977 394 499</a>
            </p>
            <p>
              <a href="mailto:admin@alvarezcat.com" class="hover:text-white transition-colors">admin@alvarezcat.com</a>
            </p>
          </address>
        </div>
      </div>

      <div class="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-gray-500">{{ t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
        <p class="text-xs text-gray-500">{{ t('footer.tagline') }}</p>
      </div>
    </div>
  </footer>
</template>
