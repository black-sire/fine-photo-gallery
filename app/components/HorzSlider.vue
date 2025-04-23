<script setup lang="ts">
const props = defineProps({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 1.0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: 'value'
  },
  shortcuts: {
    type: Array,
    default: undefined
  },
  width: {
    type: Number,
    default: 200
  },
  icon: {
    type: String,
    default: 'i-heroicons-arrows-right-left'
  }
})

const model = defineModel<number>()
const sliderContainer = ref<HTMLElement>()
const sliderGrip = ref<HTMLElement>()
const paddingInContainer = 10
const _gripSize = 40
const gripSize = computed(() => props.disabled ? 20 : _gripSize)

let startX = 0
const moving = ref(false)
const cancelMove = () => {
  moving.value = false
  document.removeEventListener('pointerleave', cancelMove)
  document.removeEventListener('pointerup', cancelMove)
  document.removeEventListener('pointermove', handlePointerMove)
}

const handlePointerMove = (e: PointerEvent) => {
  if (moving.value && e.buttons === 1) {
    const rect = (sliderContainer.value as HTMLElement)?.getBoundingClientRect()
    if (!rect) return
    const position = (e.clientX - rect.left - paddingInContainer - startX) / (rect.width - 2 * paddingInContainer)
    const value = Math.min(Math.max(position, 0), 1)
    model.value = Math.round((props.min + value * (props.max - props.min)) * 1000) / 1000
  }
}

const handlePointerDown = (e: PointerEvent) => {
  if (e.button === 0) {
    document.addEventListener('pointerleave', cancelMove)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', cancelMove)
    startX = e.offsetX - (gripSize.value / 2 - 2)
    moving.value = true
  }
}

watch(() => model.value, () => {
  updatePosition()
})

watch(() => props.disabled, () => {
  updatePosition()
})

const leftPos = ref('10px')
const updatePosition = () => {
  const rect = (sliderContainer.value as HTMLElement)?.getBoundingClientRect()
  if (!rect) return
  const w = rect.width - 2 * paddingInContainer
  const v = ((model.value || 0) - props.min) / (props.max - props.min)
  if (sliderGrip.value)
    leftPos.value = `${(40 - gripSize.value) / 2 + v * w}px`
}

onMounted(() => {
  updatePosition()
})
</script>

<template>
  <UTooltip
    :text="tooltip"
    :kbds="shortcuts as string[]"
  >
    <div
      ref="sliderContainer"
      class="slider-container select-none"
      :style="{ width: `${width}px` }"
    >
      <div class="slider pointer-events-none" />
      <div
        ref="sliderGrip"
        class="slider-grip select-none"
        :class="{ 'slider-grip-pressed': moving, 'pointer-events-none': props.disabled }"
        :style="props.disabled ? ('box-shadow: 0 0 3px #000; left:' + leftPos) : ('left:'+leftPos)"
        @pointerdown="handlePointerDown"
      >
        <UIcon
          v-if="icon && !props.disabled"
          :name="icon"
          class="grip-icon w-6 h-6 pointer-events-none select-none"
        />
      </div>
    </div>
  </UTooltip>
</template>

<style scoped lang="postcss">
.slider-container {
  --grip-size: v-bind(gripSize + 'px') ;
  position: relative;
  margin: 0 20px;
  min-width: 100px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid currentColor;

  .slider{
    position: absolute;
    width: calc(100% - 20px);
    left: 10px;
    height: 3px;
    top: calc(50% - 2px);
    background-color: currentColor;
    border-radius: 999px;
    border-bottom: 1px solid color-mix(in srgb, currentColor, white 30%);
    border-top: 1px solid color-mix(in srgb, currentColor, black 30%);
  }
  .slider-grip{
    position: absolute;
    width: calc(var(--grip-size));
    height: calc(var(--grip-size));
    top: calc(100% - var(--grip-size)/2);
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--light-base-color), white 20%);
    background-color: var(--light-base-color);
    margin: -10px;
    cursor: pointer;
    box-shadow: 0 0 10px #000;
    display: flex;
    align-items: center;
    justify-content: center;

    .grip-icon{
    }
  }
  .slider-grip-pressed{
    box-shadow: 0 0 3px #000 !important;
    transform: scale(0.94);
  }
  .slider-grip:hover{
    //background-color: #999;
    border: 2px solid #888;
  }
}
.slider-container, .slider, .slider-grip {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
