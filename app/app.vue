<script setup lang="ts">
import { useStore } from './store'

const { getAlbums } = useFile()
const store = useStore()

useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { href: 'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap', rel: 'stylesheet' }
  ],
  htmlAttrs: {
    lang: 'en'
  },
  style: [{
    id: 'root-vars',
    innerHTML: ``
  }]
})

const title = 'Ivan Riabov\' gallery'
const description = '.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogSiteName: 'Ivan Riabov\' gallery',
  ogImage: 'https://image-gallery.nuxt.dev/social-card.png',
  twitterCard: 'summary_large_image'
})

await getAlbums()
</script>

<template>
  <div
    class="bg-black spa-page"
    :class="{ 'flex flex-col md:block': $router.currentRoute.value.fullPath !== '/' }"
  >
    <UApp>
      <NuxtPage />
    </UApp>
    <!--
    <ImageThumbnailList :class="$router.currentRoute.value.fullPath !== '/' ? 'opacity-100 z-[9999]' : 'opacity-0 z-[-1]'" />
    -->
  </div>
</template>

<style lang="css">
:root,html, body, .spa-page, #__nuxt{

  --light-base2-color: color-mix(in sRGB, rgba(var(--light-base-color-rgb), 0.8), rgba(128, 128, 128, 0.8) 20%);
  --light-hi-cnst-color: rgb(var(--light-hi-cnst-color-rgb));
  --light-low-cnst-color-rgb: v-bind(store.lightLowCnstColorRGB);
  --light-low-cnst-color: rgb(var(--light-low-cnst-color-rgb));

  --ui-text: var(--light-hi-cnst-color);
  --ui-text-highlighted: var(--light-hi-cnst-color);
  --ui-primary: var(--light-hi-cnst-color);
  --ui-bg: var(--light-base-color);

  user-select: none;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: "Jost", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
.bebas-neue-regular {
  font-family: "Bebas Neue", sans-serif;
  font-weight: 400;
  font-style: normal;
}
.jost-regular {
  font-family: "Jost", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
</style>
