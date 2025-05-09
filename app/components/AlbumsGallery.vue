<script setup lang="ts">
import { useStore } from '~/store'
import type { GalImage } from '~~/types'

const isSmallScreen = useMediaQuery('(max-width: 1024px)')
const { active, initSwipe } = useImageGallery()

const store = useStore()

const { uploadImage, deleteImage, albums } = useFile()
</script>

<template>
  <section
    v-if="albums"
    ref="dropZoneRef"
    class="relative h-screen gap-[22px] overflow-auto"
    @scroll="store.galeryScrollPos = ($event.target as HTMLElement).scrollTop"
  >
    <div>
      <h1>Ivan Riabov's photographs</h1>
    </div>
    <div>
      <ul>
        <li
          v-for="album in albums"
          :key="album.id"
          @click="active = album.id"
        >
          <NuxtLink :to="`/album/${album.id}`">
            {{ album.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="postcss">
</style>
