<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()

const brands = [
  { name: 'Lisardo Castro', subtitle: 'Guijuelo · 70 años de tradición ibérica', img: '/brands/lisardo-castro.jpg', description: 'Jamones y embutidos ibéricos de la mejor calidad, criados en la dehesa salmantina.' },
  { name: 'Ramón Canals', subtitle: 'Cava & Vino · Penedès', img: '/brands/ramon-canals.jpg', description: 'Cava y vinos de alta expresión elaborados en el corazón del Penedès catalán.' },
  { name: 'La Finca Jiménez Barbero', subtitle: 'Vacuno mayor de calidad suprema', img: '/brands/la-finca.jpg', description: 'Carne de vacuno mayor seleccionada, criada en fincas propias con pastos naturales.' },
  { name: 'Conservas Agromar', subtitle: 'Asturias · +75 años de conserva', img: '/brands/agromar.jpg', description: 'Conservas de pescado del Cantábrico, una tradición familiar desde 1948.' },
  { name: 'Triticum', subtitle: 'Pan de alta gastronomía', img: '/brands/triticum.jpg', description: 'Panes artesanales de fermentación lenta para la alta restauración desde 2006.' },
  { name: 'Arotz', subtitle: 'Setas y trufas desde 1960', img: '/brands/arotz.jpg', description: 'Especialistas en setas silvestres, hongos y trufas para la gastronomía de vanguardia.' },
]

const categories = [
  { icon: '🥩', slug: 'jamon-iberico' },
  { icon: '🥓', slug: 'embutidos' },
  { icon: '🦆', slug: 'foie-pato' },
  { icon: '🐟', slug: 'ahumados' },
  { icon: '🥫', slug: 'conservas' },
  { icon: '🐠', slug: 'bacalao' },
  { icon: '🧀', slug: 'quesos' },
  { icon: '🍞', slug: 'pan-artesanal' },
  { icon: '🍄', slug: 'setas-trufas' },
  { icon: '🍷', slug: 'vinos' },
  { icon: '🫒', slug: 'aceites-vinagres' },
  { icon: '🍚', slug: 'arroz' },
  { icon: '🛒', slug: 'varios' },
]

const currentBrand = ref(0)
let interval: ReturnType<typeof setInterval>

function startSlideshow() {
  interval = setInterval(() => {
    currentBrand.value = (currentBrand.value + 1) % brands.length
  }, 4000)
}

function stopSlideshow() {
  clearInterval(interval)
}

startSlideshow()
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-black text-white py-28 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="font-display text-5xl md:text-7xl font-light mb-6">{{ t('home.hero_title') }}</h1>
        <div class="w-16 h-0.5 bg-accent mx-auto mb-6" />
        <p class="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">{{ t('home.hero_subtitle') }}</p>
        <RouterLink to="/contacto">
          <AppButton>{{ t('home.hero_cta') }}</AppButton>
        </RouterLink>
      </div>
    </section>

    <!-- Brands Slideshow -->
    <section class="py-0" @mouseenter="stopSlideshow" @mouseleave="startSlideshow">
      <div class="flex items-center justify-between px-8 py-6 border-b border-border">
        <h2 class="section-title mb-0">{{ t('home.brands_title') }}</h2>
        <RouterLink to="/marcas" class="text-sm text-muted hover:text-accent transition-colors">{{ t('home.see_all_brands') }}</RouterLink>
      </div>
      <div class="relative overflow-hidden" style="height: 400px;">
        <TransitionGroup name="brand-slide">
          <div
            v-for="(brand, i) in brands"
            v-show="currentBrand === i"
            :key="brand.name"
            class="absolute inset-0 flex items-center justify-center bg-black"
            :style="brand.img ? { backgroundImage: `url(${brand.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
          >
            <!-- Dark overlay -->
            <div class="absolute inset-0 bg-black/60" />
            <div class="relative text-center text-white px-8">
              <h3 class="font-display text-4xl md:text-6xl font-light mb-3">{{ brand.name }}</h3>
              <p class="text-accent text-sm uppercase tracking-widest mb-4">{{ brand.subtitle }}</p>
              <p class="text-white/70 max-w-lg mx-auto text-sm leading-relaxed">{{ brand.description }}</p>
            </div>
          </div>
        </TransitionGroup>

        <!-- Dots -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            v-for="(_, i) in brands"
            :key="i"
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentBrand === i ? 'bg-accent' : 'bg-white/30'"
            @click="currentBrand = i"
          />
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h2 class="section-title">{{ t('home.categories_title') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RouterLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/tienda/catalogo?category=${cat.slug}`"
            class="bg-surface border border-border p-6 text-center hover:border-body transition-colors group"
          >
            <div class="text-3xl mb-3">{{ cat.icon }}</div>
            <p class="font-sans font-semibold text-sm group-hover:text-accent transition-colors">{{ t('categories.' + cat.slug) }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="section-dark py-20 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="section-title text-white">{{ t('home.about_title') }}</h2>
        <p class="text-muted text-lg leading-relaxed mb-8">{{ t('home.about_text') }}</p>
        <RouterLink to="/sobre-nosotros">
          <AppButton variant="secondary" class="border-white text-white hover:bg-white hover:text-black">
            {{ t('home.learn_more') }}
          </AppButton>
        </RouterLink>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-4 border-t-2 border-accent">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="font-display text-3xl font-light mb-4">{{ t('home.contact_cta') }}</h2>
        <p class="text-muted mb-8">{{ t('home.contact_cta_sub') }}</p>
        <RouterLink to="/contacto">
          <AppButton>{{ t('home.hero_cta') }}</AppButton>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.brand-slide-enter-active, .brand-slide-leave-active {
  transition: opacity 0.8s ease;
}
.brand-slide-enter-from, .brand-slide-leave-to {
  opacity: 0;
}
</style>
