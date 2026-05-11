<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const form = ref({ name: '', email: '', company: '', message: '' })
const sent = ref(false)
const sending = ref(false)

async function submit() {
  sending.value = true
  // Simulate send (in production: POST /contact)
  await new Promise((r) => setTimeout(r, 800))
  sent.value = true
  sending.value = false
}
</script>

<template>
  <div>
    <section class="bg-black text-white py-24 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-display text-5xl font-light mb-4">{{ t('contact.title') }}</h1>
        <div class="w-12 h-0.5 bg-accent mb-6" />
        <p class="text-muted text-lg">{{ t('contact.subtitle') }}</p>
      </div>
    </section>

    <section class="py-20 px-4">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
        <!-- Form -->
        <div>
          <h2 class="section-title">{{ t('contact.form_title') }}</h2>
          <div v-if="sent" class="p-6 bg-green-50 border border-green-200 text-green-800">
            {{ t('contact.success') }}
          </div>
          <form v-else class="space-y-4" @submit.prevent="submit">
            <AppInput v-model="form.name" :label="t('contact.name')" required />
            <AppInput v-model="form.email" :label="t('contact.email')" type="email" required />
            <AppInput v-model="form.company" :label="t('contact.company')" required />
            <div>
              <label class="text-sm font-semibold text-body block mb-1">{{ t('contact.message') }} *</label>
              <textarea
                v-model="form.message"
                rows="5"
                class="input-field resize-none"
                required
              />
            </div>
            <AppButton type="submit" :loading="sending">{{ t('contact.send') }}</AppButton>
          </form>
        </div>

        <!-- Info -->
        <div>
          <h2 class="section-title">{{ t('contact.info_title') }}</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-2">{{ t('contact.address') }}</h3>
              <address class="not-italic text-body leading-relaxed">
                Alvarez Catalunya S.L.<br />
                Calle del mas de l'Abad - Nave 133<br />
                CP 43480 · Vila-Seca de Solzina<br />
                Tarragona, España
              </address>
            </div>
            <div>
              <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-2">{{ t('contact.phone') }}</h3>
              <a href="tel:+34977394499" class="text-body hover:text-accent">T. 977 394 499</a>
            </div>
            <div>
              <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Email</h3>
              <a href="mailto:admin@alvarezcat.com" class="text-body hover:text-accent">admin@alvarezcat.com</a>
            </div>
            <div class="bg-surface border border-border p-6">
              <h3 class="font-semibold mb-2">{{ t('contact.professionals_title') }}</h3>
              <p class="text-sm text-muted leading-relaxed">{{ t('contact.professionals_text') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
