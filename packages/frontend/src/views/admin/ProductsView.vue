<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '../../api/customers.api'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'
import AppInput from '../../components/ui/AppInput.vue'
import type { CategoryDto } from '@alvarez/shared'

const { t } = useI18n()

const products = ref<unknown[]>([])
const categories = ref<CategoryDto[]>([])
const total = ref(0)
const page = ref(1)
const search = ref('')
const loading = ref(false)
const modalOpen = ref(false)
const editingProduct = ref<Record<string, unknown> | null>(null)
const saving = ref(false)

// ── Bulk import ──────────────────────────────────────────────────────────────
const bulkFileInput = ref<HTMLInputElement>()
const bulkLoading = ref(false)
const bulkResult = ref<{ created: number; updated: number; errors: Array<{ row: number; sku: string; error: string }> } | null>(null)

const form = ref({
  sku: '', name: '', description: '', brand: '', categoryId: '',
  pricePerKg: '', pricePerUnit: '', unit: 'Ud.', packageSize: '',
  unitsPerBox: '', stock: '0', tags: '', isActive: true,
})

async function fetch() {
  loading.value = true
  const [prodRes, catRes] = await Promise.all([
    adminApi.adminProducts({ page: page.value, search: search.value }),
    adminApi.adminCategories(),
  ])
  products.value = prodRes.data.products
  total.value = prodRes.data.total
  categories.value = catRes.data
  loading.value = false
}

onMounted(fetch)
watch(search, () => { page.value = 1; fetch() })

function openNew() {
  editingProduct.value = null
  form.value = { sku: '', name: '', description: '', brand: '', categoryId: '', pricePerKg: '', pricePerUnit: '', unit: 'Ud.', packageSize: '', unitsPerBox: '', stock: '0', tags: '', isActive: true }
  modalOpen.value = true
}

function openEdit(p: Record<string, unknown>) {
  editingProduct.value = p
  form.value = {
    sku: p.sku as string,
    name: p.name as string,
    description: (p.description as string) ?? '',
    brand: (p.brand as string) ?? '',
    categoryId: p.categoryId as string,
    pricePerKg: p.pricePerKg ? String(p.pricePerKg) : '',
    pricePerUnit: p.pricePerUnit ? String(p.pricePerUnit) : '',
    unit: p.unit as string,
    packageSize: p.packageSize as string,
    unitsPerBox: p.unitsPerBox ? String(p.unitsPerBox) : '',
    stock: String(p.stock),
    tags: ((p.tags as string[]) ?? []).join(', '),
    isActive: p.isActive as boolean,
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  const payload = {
    ...form.value,
    pricePerKg: form.value.pricePerKg ? parseFloat(form.value.pricePerKg) : undefined,
    pricePerUnit: form.value.pricePerUnit ? parseFloat(form.value.pricePerUnit) : undefined,
    unitsPerBox: form.value.unitsPerBox ? parseInt(form.value.unitsPerBox) : undefined,
    stock: parseInt(form.value.stock),
    tags: form.value.tags.split(',').map((t) => t.trim()).filter(Boolean),
  }
  if (editingProduct.value) {
    await adminApi.updateProduct(editingProduct.value.id as string, payload)
  } else {
    await adminApi.createProduct(payload)
  }
  modalOpen.value = false
  saving.value = false
  fetch()
}

async function deleteProduct(id: string) {
  if (!confirm(t('admin.confirm_delete'))) return
  await adminApi.deleteProduct(id)
  fetch()
}

async function handleBulkImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  bulkLoading.value = true
  bulkResult.value = null
  try {
    const { data } = await adminApi.bulkImportProducts(file)
    bulkResult.value = data
    fetch()
  } catch {
    bulkResult.value = { created: 0, updated: 0, errors: [{ row: 0, sku: '', error: 'Upload failed — please check the file' }] }
  } finally {
    bulkLoading.value = false
    if (bulkFileInput.value) bulkFileInput.value.value = ''
  }
}

async function downloadProductTemplate() {
  const { data } = await adminApi.downloadProductTemplate()
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url; a.download = 'products_template.xlsx'; a.click()
  URL.revokeObjectURL(url)
}

type Product = { id: string; sku: string; name: string; brand?: string; category: { name: string }; pricePerUnit?: number; pricePerKg?: number; stock: number; isActive: boolean }
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-3xl font-light">{{ t('admin.products') }}</h1>
      <div class="flex gap-3">
        <!-- Bulk import -->
        <input ref="bulkFileInput" type="file" accept=".xlsx" class="hidden" @change="handleBulkImport" />
        <AppButton variant="secondary" :loading="bulkLoading" @click="bulkFileInput?.click()">
          {{ t('admin.bulk_import') }}
        </AppButton>
        <AppButton @click="openNew">{{ t('admin.add_product') }}</AppButton>
      </div>
    </div>

    <!-- Bulk import result -->
    <div v-if="bulkResult" class="mb-6 border border-border">
      <div class="bg-black text-white px-4 py-3 flex items-center justify-between">
        <span class="font-semibold text-sm">{{ t('admin.import_result') }}</span>
        <button class="text-white/60 hover:text-white text-lg leading-none" @click="bulkResult = null">×</button>
      </div>
      <div class="p-4 bg-surface">
        <div class="flex gap-6 mb-3">
          <span class="text-sm"><span class="font-semibold text-green-700">{{ bulkResult.created }}</span> {{ t('admin.created') }}</span>
          <span class="text-sm"><span class="font-semibold text-blue-700">{{ bulkResult.updated }}</span> {{ t('admin.updated') }}</span>
          <span v-if="bulkResult.errors.length" class="text-sm"><span class="font-semibold text-red-600">{{ bulkResult.errors.length }}</span> {{ t('admin.errors') }}</span>
        </div>
        <div v-if="bulkResult.errors.length" class="space-y-1">
          <div v-for="e in bulkResult.errors" :key="e.row" class="text-xs text-red-700 bg-red-50 px-3 py-1.5 border border-red-200">
            {{ t('admin.row') }} {{ e.row }}<span v-if="e.sku"> · SKU {{ e.sku }}</span>: {{ e.error }}
          </div>
        </div>
        <p class="text-xs text-muted mt-2">
          <button class="underline hover:no-underline" @click="downloadProductTemplate">{{ t('admin.download_template') }}</button>
        </p>
      </div>
    </div>

    <!-- Search + tip -->
    <div class="flex items-center gap-4 mb-6">
      <input v-model="search" :placeholder="t('admin.search')" class="input-field w-80" />
      <p v-if="!bulkResult" class="text-xs text-muted">
        <button class="underline hover:no-underline" @click="downloadProductTemplate">{{ t('admin.download_template') }}</button>
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full bg-white border border-border text-sm">
        <thead class="bg-surface border-b border-border">
          <tr>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.sku') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.name') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.brand') }}</th>
            <th class="text-left p-4 font-semibold">{{ t('admin.table.category') }}</th>
            <th class="text-right p-4 font-semibold">{{ t('admin.table.price_kg') }}</th>
            <th class="text-right p-4 font-semibold">{{ t('admin.table.stock') }}</th>
            <th class="p-4"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in (products as Product[])" :key="p.id" class="border-b border-border hover:bg-surface">
            <td class="p-4 font-mono text-xs text-muted">{{ p.sku }}</td>
            <td class="p-4 font-semibold">{{ p.name }}</td>
            <td class="p-4 text-muted">{{ p.brand ?? '—' }}</td>
            <td class="p-4 text-muted">{{ p.category?.name }}</td>
            <td class="p-4 text-right">€{{ (p.pricePerUnit ?? p.pricePerKg ?? 0).toFixed(2) }}</td>
            <td class="p-4 text-right" :class="p.stock <= 5 ? 'text-red-600 font-semibold' : ''">{{ p.stock }}</td>
            <td class="p-4">
              <div class="flex gap-2 justify-end">
                <button class="text-xs text-accent hover:underline" @click="openEdit(p as unknown as Record<string, unknown>)">{{ t('common.edit') }}</button>
                <button class="text-xs text-muted hover:text-red-600" @click="deleteProduct(p.id)">{{ t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-sm text-muted mt-4">{{ total }} {{ t('admin.products').toLowerCase() }}</p>

    <!-- Product modal -->
    <AppModal :open="modalOpen" :title="editingProduct ? t('admin.product_form.edit_title') : t('admin.product_form.add_title')" @close="modalOpen = false">
      <form class="space-y-3" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.sku" :label="t('admin.product_form.sku')" required />
          <AppInput v-model="form.stock" :label="t('admin.product_form.stock')" type="number" />
        </div>
        <AppInput v-model="form.name" :label="t('admin.product_form.name')" required />
        <AppInput v-model="form.brand" :label="t('admin.product_form.brand')" />
        <div>
          <label class="text-sm font-semibold block mb-1">{{ t('admin.product_form.category') }} *</label>
          <select v-model="form.categoryId" class="input-field" required>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.pricePerKg" :label="`${t('admin.product_form.price_kg')} (€)`" type="number" />
          <AppInput v-model="form.pricePerUnit" :label="`${t('admin.product_form.price_unit')} (€)`" type="number" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.unit" :label="t('product.unit')" required />
          <AppInput v-model="form.unitsPerBox" :label="t('admin.product_form.units_box')" type="number" />
        </div>
        <AppInput v-model="form.packageSize" :label="t('admin.product_form.package')" required />
        <AppInput v-model="form.tags" :label="`${t('admin.product_form.tags')} (FI, SF, FD, SP)`" />
        <div>
          <label class="text-sm font-semibold block mb-1">{{ t('admin.product_form.description') }}</label>
          <textarea v-model="form.description" rows="3" class="input-field resize-none" />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isActive" type="checkbox" id="isActive" class="accent-accent" />
          <label for="isActive" class="text-sm">{{ t('admin.table.active') }}</label>
        </div>
        <div class="flex gap-3 pt-2">
          <AppButton type="submit" :loading="saving">{{ t('admin.save') }}</AppButton>
          <AppButton variant="secondary" type="button" @click="modalOpen = false">{{ t('admin.cancel') }}</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
