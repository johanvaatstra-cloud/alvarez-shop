<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()

const brands = [
  { key: 'lisardoCastro', name: 'Lisardo Castro', origin: 'Guijuelo, Salamanca', since: '1953', image: '/brands/lisardo-castro.jpg' },
  { key: 'ibericosTorreon', name: 'Ibéricos Torreón', origin: 'Extremadura', since: '1975', image: '/brands/ibericos-torreon.jpg' },
  { key: 'martiko', name: 'Martiko', origin: 'Navarra', since: '1976', image: '/brands/martiko.png' },
  { key: 'martikoAhumados', name: 'Martiko Ahumados', origin: 'Navarra', since: '1976', image: '/brands/martiko-ahumados.jpg' },
  { key: 'agromar', name: 'Conservas Agromar', origin: 'Lastres, Asturias', since: '1948', image: '/brands/agromar.jpg' },
  { key: 'anxovesEscala', name: "Anxoves l'Escala", origin: "L'Escala, Girona", since: '1900', image: '/brands/anxoves-escala.jpg' },
  { key: 'camporel', name: 'Conservas Camporel', origin: 'España', since: '1985', image: '/brands/camporel.jpg' },
  { key: 'sayomar', name: 'Bacalaos Sayomar', origin: 'País Vasco', since: '1950', image: '/brands/bacalaos-sayomar.jpg' },
  { key: 'aquanaria', name: 'Aquanaria', origin: 'Gran Canaria', since: '2003', image: '/brands/aquanaria.jpg' },
  { key: 'ameztoi', name: 'Ameztoi', origin: 'Zarautz, País Vasco', since: '1974', image: '/brands/ameztoi.png' },
  { key: 'arotz', name: 'Arotz', origin: 'Navarra', since: '1960', image: '/brands/arotz.jpg' },
  { key: 'triticum', name: 'Triticum', origin: 'Barcelona', since: '2006', image: '/brands/triticum.jpg' },
  { key: 'juanitoBaker', name: 'Juanito Baker', origin: 'Barcelona', since: '2010', image: '/brands/juanito.jpg' },
  { key: 'laFinca', name: 'La Finca Jiménez Barbero', origin: 'Colmenar Viejo, Madrid', since: '1990', image: '/brands/la-finca.jpg' },
  { key: 'ramonCanals', name: 'Ramón Canals', origin: "Sant Sadurní d'Anoia, Penedès", since: '1901', image: '/brands/ramon-canals.jpg' },
  { key: 'casaRojo', name: 'Casa Rojo', origin: 'Varias D.O., España', since: '2005', image: '/brands/casa-rojo.jpg' },
  { key: 'emperatriz', name: 'Finca La Emperatriz', origin: 'Rioja', since: '1890', image: '/brands/emperatriz.jpg' },
  { key: 'vinaIjalba', name: 'Viña Ijalba', origin: 'Logroño, Rioja', since: '1975', image: '/brands/vina-ijalba.jpg' },
  { key: 'tomasPostigo', name: 'Tomás Postigo', origin: 'Valladolid, Ribera del Duero', since: '1982', image: '/brands/tomas-postigo.jpg' },
  { key: 'molinoRoca', name: 'Molino Roca', origin: 'Cataluña', since: '1945', image: '/brands/molino-roca.jpg' },
  { key: 'treArchi', name: 'Tre Archi', origin: 'Italia', since: '1970', image: '/brands/tre-archi.jpg' },
  { key: 'beautifood', name: 'Beautifood', origin: 'España', since: '2015', image: '/brands/beautifood.jpg' },
]
</script>

<template>
  <div>
    <!-- Header -->
    <section class="bg-black text-white py-24 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-display text-5xl font-light mb-4">{{ t('brandsPage.title') }}</h1>
        <div class="w-12 h-0.5 bg-accent mb-6" />
        <p class="text-muted text-lg max-w-2xl leading-relaxed">{{ t('brandsPage.subtitle') }}</p>
      </div>
    </section>

    <!-- Brands -->
    <section class="py-0">
      <div v-for="(brand, i) in brands" :key="brand.key">
        <div :class="['py-0', i % 2 === 0 ? 'bg-white' : 'bg-surface']">

          <!-- Brand image (full width, if available) -->
          <div v-if="brand.image" class="w-full h-64 md:h-80 overflow-hidden relative">
            <img :src="brand.image" :alt="brand.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="absolute bottom-6 left-8">
              <p class="text-xs text-accent uppercase tracking-widest font-semibold mb-1">{{ t(`brandsPage.items.${brand.key}.category`) }}</p>
              <h2 class="font-display text-3xl md:text-4xl font-light text-white">{{ brand.name }}</h2>
              <p class="text-white/70 text-sm">{{ brand.origin }} · {{ t('brandsPage.since') }} {{ brand.since }}</p>
            </div>
          </div>

          <!-- No-image header -->
          <div v-else class="bg-black py-10 px-8">
            <div class="max-w-5xl mx-auto">
              <p class="text-xs text-accent uppercase tracking-widest font-semibold mb-1">{{ t(`brandsPage.items.${brand.key}.category`) }}</p>
              <h2 class="font-display text-3xl md:text-4xl font-light text-white">{{ brand.name }}</h2>
              <p class="text-white/50 text-sm">{{ brand.origin }} · {{ t('brandsPage.since') }} {{ brand.since }}</p>
            </div>
          </div>

          <!-- Content -->
          <div class="py-10 px-4">
            <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
              <div :class="i % 2 === 1 ? 'md:order-2' : ''">
                <div class="w-8 h-0.5 bg-accent mb-4" />
                <p class="text-body leading-relaxed">{{ t(`brandsPage.items.${brand.key}.story`) }}</p>
              </div>
              <div :class="i % 2 === 1 ? 'md:order-1' : ''">
                <div class="bg-black text-white p-6">
                  <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">{{ t('brandsPage.mainProducts') }}</h3>
                  <ul class="space-y-2">
                    <li v-for="product in (tm(`brandsPage.items.${brand.key}.products`) as string[])" :key="product" class="flex items-center gap-3 text-sm text-white">
                      <span class="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                      {{ product }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Selec Mardis network -->
    <section class="py-20 px-4 bg-black text-white">
      <div class="max-w-5xl mx-auto text-center mb-12">
        <h2 class="font-display text-3xl font-light mb-4">{{ t('brandsPage.networkTitle') }}</h2>
        <div class="w-12 h-0.5 bg-accent mx-auto mb-6" />
        <p class="text-muted max-w-2xl mx-auto leading-relaxed">{{ t('brandsPage.networkText') }}</p>
      </div>
      <div class="max-w-4xl mx-auto">
        <img
          src="/brands/selec-mardis-mapa.jpg"
          :alt="t('brandsPage.networkMapAlt')"
          class="w-full rounded-none object-contain max-h-96"
        />
      </div>
    </section>
  </div>
</template>
