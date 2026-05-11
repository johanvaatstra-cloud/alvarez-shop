import { createI18n } from 'vue-i18n'
import es from './es.json'
import ca from './ca.json'
import en from './en.json'
import nl from './nl.json'
import de from './de.json'
import fr from './fr.json'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') ?? 'es',
  fallbackLocale: 'es',
  messages: { es, ca, en, nl, de, fr },
})
