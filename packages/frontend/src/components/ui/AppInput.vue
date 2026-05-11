<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-semibold text-body">
      {{ label }}<span v-if="required" class="text-accent ml-0.5">*</span>
    </label>
    <input
      :value="modelValue"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="input-field"
      :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>
