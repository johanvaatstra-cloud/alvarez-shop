<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'
import AppButton from '../../components/ui/AppButton.vue'
import type { ImportResult } from '@alvarez/shared'

const { t } = useI18n()

const dragOver = ref(false)
const selectedFile = ref<File | null>(null)
const importing = ref(false)
const result = ref<ImportResult | null>(null)
const error = ref('')

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.name.endsWith('.csv')) selectedFile.value = file
}

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) selectedFile.value = file
}

async function downloadTemplate() {
  const { data } = await adminApi.downloadTemplate()
  const blob = new Blob([data], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'clientes_plantilla.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function importFile() {
  if (!selectedFile.value) return
  importing.value = true
  error.value = ''
  result.value = null
  try {
    const { data } = await adminApi.importCustomers(selectedFile.value)
    result.value = data
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } }
    error.value = e.response?.data?.error ?? t('errors.generic')
  } finally {
    importing.value = false
  }
}

function reset() {
  selectedFile.value = null
  result.value = null
  error.value = ''
}
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="font-display text-3xl font-light">{{ t('import.title') }}</h1>
      <RouterLink to="/admin/clientes" class="text-sm text-muted hover:text-body">{{ t('import.back') }}</RouterLink>
    </div>

    <p class="text-muted mb-6">{{ t('import.subtitle') }}</p>

    <!-- Step 1: Download template -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold mb-1">{{ t('import.step1_title') }}</h2>
          <p class="text-sm text-muted">{{ t('import.step1_desc') }}</p>
        </div>
        <AppButton variant="secondary" @click="downloadTemplate">{{ t('import.download_template') }}</AppButton>
      </div>
    </div>

    <!-- Step 2: Upload -->
    <div class="card mb-6">
      <h2 class="font-semibold mb-4">{{ t('import.step2_title') }} — {{ t('import.upload') }}</h2>

      <div
        class="border-2 border-dashed p-12 text-center transition-colors cursor-pointer"
        :class="dragOver ? 'border-accent bg-red-50' : 'border-border hover:border-body'"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
        @click="($refs.fileInput as HTMLInputElement).click()"
      >
        <svg class="w-10 h-10 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-muted">{{ selectedFile ? selectedFile.name : t('import.drag_drop') }}</p>
        <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileInput" />
      </div>
    </div>

    <!-- Step 3: Import -->
    <div v-if="selectedFile && !result" class="card mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold mb-1">{{ t('import.step3_title') }}</h2>
          <p class="text-sm text-muted">{{ t('import.file_label') }} <strong>{{ selectedFile.name }}</strong></p>
        </div>
        <div class="flex gap-3">
          <AppButton variant="secondary" @click="reset">{{ t('common.cancel') }}</AppButton>
          <AppButton :loading="importing" @click="importFile">
            {{ importing ? t('import.importing') : t('import.import_btn') }}
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 mb-6">{{ error }}</div>

    <!-- Result -->
    <div v-if="result" class="card">
      <h2 class="font-semibold mb-4">{{ t('import.success') }}</h2>
      <div class="grid grid-cols-3 gap-4 mb-6 text-center">
        <div class="bg-green-50 border border-green-200 p-4">
          <p class="text-3xl font-display font-light text-green-700">{{ result.rowsSuccess }}</p>
          <p class="text-xs text-green-700 font-semibold">{{ t('import.rows_created') }}</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 p-4">
          <p class="text-3xl font-display font-light text-amber-700">{{ result.rowsSkipped }}</p>
          <p class="text-xs text-amber-700 font-semibold">{{ t('import.rows_skipped') }}</p>
        </div>
        <div class="bg-red-50 border border-red-200 p-4">
          <p class="text-3xl font-display font-light text-red-700">{{ result.rowsError }}</p>
          <p class="text-xs text-red-700 font-semibold">{{ t('import.rows_errors') }}</p>
        </div>
      </div>

      <!-- Errors detail -->
      <div v-if="result.errors.length">
        <h3 class="font-semibold text-sm mb-2">{{ t('import.error_detail') }}</h3>
        <div class="max-h-60 overflow-y-auto border border-border">
          <table class="w-full text-xs">
            <thead class="bg-surface sticky top-0">
              <tr>
                <th class="text-left p-2 font-semibold">{{ t('import.column') }}</th>
                <th class="text-left p-2 font-semibold">Email / CIF</th>
                <th class="text-left p-2 font-semibold">{{ t('import.description_col') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="err in result.errors" :key="err.row" class="border-t border-border">
                <td class="p-2">{{ err.row }}</td>
                <td class="p-2 text-muted">{{ err.email ?? err.vatNumber }}</td>
                <td class="p-2 text-red-600">{{ err.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AppButton variant="secondary" class="mt-4" @click="reset">{{ t('import.new_import') }}</AppButton>
    </div>

    <!-- Column guide -->
    <div class="mt-8 card">
      <h2 class="font-semibold mb-4">{{ t('import.columns_title') }}</h2>
      <table class="w-full text-xs">
        <thead class="bg-surface">
          <tr>
            <th class="text-left p-2 font-semibold">{{ t('import.column') }}</th>
            <th class="text-left p-2 font-semibold">{{ t('import.required_col') }}</th>
            <th class="text-left p-2 font-semibold">{{ t('import.description_col') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="col in [
            { name: 'externalId', req: false, desc: 'ID del sistema existente' },
            { name: 'companyName', req: true, desc: 'Nombre comercial de la empresa' },
            { name: 'vatNumber', req: true, desc: 'CIF/NIF — clave de deduplicación' },
            { name: 'contactName', req: true, desc: 'Nombre del contacto principal' },
            { name: 'email', req: true, desc: 'Email de acceso a la plataforma' },
            { name: 'phone', req: false, desc: 'Teléfono de contacto' },
            { name: 'street', req: true, desc: 'Dirección de entrega' },
            { name: 'city', req: true, desc: 'Ciudad' },
            { name: 'postalCode', req: true, desc: 'Código postal' },
            { name: 'province', req: true, desc: 'Provincia (ej: Tarragona)' },
            { name: 'paymentMethod', req: true, desc: 'ONLINE o ON_ACCOUNT' },
            { name: 'creditLimit', req: false, desc: 'Límite crédito en € (solo ON_ACCOUNT)' },
            { name: 'paymentTermDays', req: false, desc: 'Días de pago: 30, 60...' },
          ]" :key="col.name" class="hover:bg-surface">
            <td class="p-2 font-mono">{{ col.name }}</td>
            <td class="p-2">
              <span v-if="col.req" class="text-accent font-semibold">✓</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="p-2 text-muted">{{ col.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
