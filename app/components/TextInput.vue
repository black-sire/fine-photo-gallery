<script setup lang="ts">
const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  multiline: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:value'])
</script>

<template>
  <div class="relative">
    <span class="label-text">{{ props.label }}</span>
    <input
      v-if="!props.multiline"
      class="editable-field"
      :class="{ 'readonly-field': props.readonly }"
      :value="props.value"
      :readonly="props.readonly"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    >
    <textarea
      v-else
      class="editable-field"
      :class="{ 'readonly-field': props.readonly }"
      :value="props.value"
      :readonly="props.readonly"
      @input="emit('update:value', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<style scoped lang="postcss">
.label-text {
  font-size: 18px;
  font-weight: 800;
  color: var(--light-low-cnst-color);
  position: relative;
  line-height: 10px;
  top: 7px;
  left: 0;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  z-index: 1;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
input.editable-field{
  margin-bottom: 6px;
}
.editable-field{
  position: relative;
  z-index: 1001;
  display: inline-block;
  width: 100%;
  white-space: pre-line;
  background-color: var(--light-base-color);
  border-radius: 3px;
  padding: 8px 4px 2px 16px;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
.editable-field.readonly-field{
  background-color: transparent;
}
</style>
