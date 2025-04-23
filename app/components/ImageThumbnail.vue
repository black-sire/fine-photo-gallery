<script setup lang="ts">
defineProps({
  thumbnail: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <li
    v-if="$router.currentRoute.value.params.slug"
    class="text-black inline-block relative"
    :class="{ 'z-50': thumbnail.id === $router.currentRoute.value.params.slug!.join('/') }"
  >
    <NuxtLink :to="`/detail/${thumbnail.id}`">
      <img
        v-if="thumbnail"
        width="83"
        height="51"
        :src="`/images/${thumbnail.pathname_thumb}`"
        :alt="thumbnail.key"
        class="object-cover rounded-md transition-all duration-500 hover:brightness-100 w-[83px] h-[51px]"
        :class="thumbnail.id === $router.currentRoute.value.params.slug!.join('/') ? 'active brightness-100' : 'opacity-75 brightness-50'"
      >
    </NuxtLink>
  </li>
</template>
