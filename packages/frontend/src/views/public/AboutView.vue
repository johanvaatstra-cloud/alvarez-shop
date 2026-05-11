<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div>
    <!-- Header -->
    <section class="bg-black text-white py-24 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-display text-5xl font-light mb-6">{{ t('about.title') }}</h1>
        <div class="w-12 h-0.5 bg-accent mb-6" />
        <p class="text-muted text-lg max-w-2xl leading-relaxed">{{ t('about.subtitle') }}</p>
      </div>
    </section>

    <!-- Story -->
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <h2 class="section-title">{{ t('about.history_title') }}</h2>
          <p class="text-body leading-relaxed mb-4">{{ t('about.history_p1') }}</p>
          <p class="text-body leading-relaxed mb-4">{{ t('about.history_p2') }}</p>
          <p class="text-body leading-relaxed">{{ t('about.history_p3') }}</p>
        </div>
        <div>
          <h2 class="section-title">{{ t('about.selec_title') }}</h2>
          <p class="text-body leading-relaxed mb-4" v-html="t('about.selec_p1')" />
          <p class="text-body leading-relaxed mb-4">{{ t('about.selec_p2') }}</p>
          <p class="text-body leading-relaxed mb-6">{{ t('about.selec_p3') }}</p>
          <img
            src="/brands/selec-mardis-mapa.jpg"
            :alt="t('about.selec_map_alt')"
            class="w-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="section-dark py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <h2 class="section-title text-white">{{ t('about.values_title') }}</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="border border-white/10 p-6">
            <h3 class="font-display text-xl font-light mb-3 text-white">{{ t('about.value1_title') }}</h3>
            <p class="text-muted text-sm leading-relaxed">{{ t('about.value1_text') }}</p>
          </div>
          <div class="border border-white/10 p-6">
            <h3 class="font-display text-xl font-light mb-3 text-white">{{ t('about.value2_title') }}</h3>
            <p class="text-muted text-sm leading-relaxed">{{ t('about.value2_text') }}</p>
          </div>
          <div class="border border-white/10 p-6">
            <h3 class="font-display text-xl font-light mb-3 text-white">{{ t('about.value3_title') }}</h3>
            <p class="text-muted text-sm leading-relaxed">{{ t('about.value3_text') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
