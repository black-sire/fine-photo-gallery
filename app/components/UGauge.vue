<script setup lang="ts">
const props = defineProps({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  modelValue: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <div
    class="flex justify-between items-center relative"
    :class="{ 'pointer-events-none': disabled }"
    :style="{ color: disabled ? 'var(--light-low-cnst-color)' : 'var(--light-hi-cnst-color)' }"
  >
    <span
      class="w-40 transition-colors duration-200"
    >
      {{ title }}
    </span>

    <HorzSlider
      v-model="value"
      :min="min"
      :max="max"
      :disabled="disabled"
      :width="190"
    />

    <span
      class="text-center text-medium w-16 px-2 transition-colors duration-200"
      :style="{ color: disabled ? 'var(--light-low-cnst-color)': 'var(--light-hi-cnst-color)', minWidth: '50px' }"
    > {{ Math.round(modelValue*100)/100 }} </span>
  </div>
</template>
