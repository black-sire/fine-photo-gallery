<script setup lang="ts">
defineEmits(['resetFilter', 'close'])
</script>

<template>
  <div class="util-window flex flex-col justify-between w-[400px] z-50">
    <div class="window-title">
      <div class="window-title-text">
        <slot name="title" />
      </div>
      <UButton
        icon="i-heroicons-x-mark"
        variant="ghost"
        color="neutral"
        size="xs"
        class="flex absolute top-3 right-3"
        @click="$emit('close')"
      />
    </div>
    <div
      class="p-5"
      style="box-shadow: 0 -20px 25px -20px rgba(var(--light-base-color-rgb), 0.7)"
    >
      <slot />
    </div>
    <div class="flex justify-end pb-5 pl-5 pr-5 gap-4">
      <slot name="buttons" />
    </div>
  </div>
</template>

<style>
.util-window {
  background-color: var(--light-base2-color);
  border: 1px solid var(--light-low-cnst-color);
  color: var(--light-hi-cnst-color);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border-radius: 6px;

  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, translate;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;

  .window-title {
    overflow: hidden;
    height: 50px;
    box-shadow: 0 20px 30px -20px rgba(var(--light-low-cnst-color-rgb), 0.7);

    .window-title-text {
      color: var(--light-hi-cnst-color);
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;

      font-family: "Bebas Neue", sans-serif;
      font-weight: 700;
      font-size: 55px;
      position: relative;
      top: -4px;
      width: 100%;
      height: 64px;
      letter-spacing: 1px;
      text-align: center;
    }
  }
}
</style>
