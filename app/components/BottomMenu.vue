<script setup lang="ts">
import { useStore } from '~/store'

/* const props = */ defineProps({
  filter: {
    type: Boolean,
    default: false
  }
})

const store = useStore()

// const route = useRoute()
</script>

<template>
  <div class="fixed z-[9999] justify-center flex items-center bottom-3 gap-2">
    <slot name="prepend" />
    <div
      :class="[filter ? 'h-auto rounded-md p-8' : 'h-[60px]', store.maximizedMenu ? 'menu-maximized' : 'w-[60px] overflow-hidden']"
      class="justify-center flex flex-col mx-auto transition-all duration-500 rounded-full after:rounded-full"
      :style="{ backgroundColor: store.maximizedMenu ? 'var(--light-base2-color)' : 'transparent', border: store.maximizedMenu ? '1px solid var(--light-low-cnst-color)' : 'none', color: 'var(--light-hi-cnst-color)' }"
    >
      <slot name="filter" />
      <div
        class="flex justify-between items-center h-full z-50"
        :class="filter ? 'pt-6' : 'pr-4'"
        style="padding-left: 8px;"
      >
        <div
          class="text-sm text-center pr-3 cursor-pointer hover:text-gray-200 transition-hover duration-200 transition-colors"
          :class="{ 'px-2': !filter }"
          @click="store.toggleMaximizedMenu()"
        >
          <svg
            v-if="!store.maximizedMenu"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke-width="2.0"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
          <svg
            v-else
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div
          class="flex gap-2 transition-all duration-500 items-center justify-center"
          :class="store.maximizedMenu ? 'opacity-100' : 'opacity-0'"
        >
          <slot name="description" />
          <slot name="buttons" />
        </div>
      </div>
    </div>
    <slot name="append" />
  </div>
</template>

<style scoped>
.menu-maximized {
  width: 300px;
}
</style>
