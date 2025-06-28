<script setup lang="ts">
import seedrandom from 'seedrandom'
import { useStore } from '~/store'
import type { GalImage, GalAlbum } from '~~/types'

// const isSmallScreen = useMediaQuery('(max-width: 1024px)')
const { getAlbums, onCatalogLoad } = useFile()
const albums = ref(getAlbums())

/*
const hash = (str: string) => {
  let hash = 0, i, chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash
}
*/
const imgData: { [albumId: string]: { offsetx: number, offsety: number, rotate: number, width: number }[] } = {}
onCatalogLoad((a) => {
  albums.value = a
  let offset = 200
  albums.value.forEach((album) => {
    imgData[album.id] = []
    album.images.forEach((image) => {
      const img = image as GalImage
      const rnd = seedrandom('' + image.id)
      const w = 200 * img.width / img.height
      imgData[album.id]?.push({
        width: w,
        offsetx: offset,
        offsety: Math.round(rnd() * 10) - 5,
        rotate: rnd() * 4 - 2
      })
      offset += w - 30
    })
  })
})

const store = useStore()

const imagesRefs = ref<(Element | ComponentPublicInstance | null)[]>([])

const functionRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  imagesRefs.value[index] = el
}

function getImageStyle(album: GalAlbum, image: GalImage, index: number) {
  const d = imgData[album.id]?.[index]
  return {
    '--orgPos': `${d?.offsetx}px`,
    'width': `${d?.width}px`,
    'height': '200px',
    'left': `30px`,
    'zIndex': 10000 - index,
    'transform': `translateY(${d?.offsety || 0}px) rotateZ(${d?.rotate || 0}deg)`
  }
}

onMounted(() => {
  imagesRefs.value?.forEach((ref) => {
    if (ref) {
      (ref as HTMLElement).style.left = `var(--orgPos)`
    }
  })
})

let dragging = false
let dragStartX = 0
const pointerMove = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (dragging) {
    const offset = e.clientX - dragStartX
    imagesRefs.value.forEach((ref) => {
      if (ref) {
        const v = (ref as HTMLElement).style.getPropertyValue('--orgPos')
        const o = parseFloat(v) || 0;
        (ref as HTMLElement).style.setProperty('--orgPos', `${o + offset}px`)
      }
    })
  }
}

const pointerUp = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  dragging = false
  document.removeEventListener('pointermove', pointerMove)
  document.removeEventListener('pointerup', pointerUp)
}

const pointerDown = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  dragging = true
  dragStartX = e.clientX
  document.addEventListener('pointermove', pointerMove)
  document.addEventListener('pointerup', pointerUp)
}
</script>

<template>
  <section
    v-if="albums"
    ref="dropZoneRef"
    class="relative h-screen gap-[22px] overflow-hidden p-[30px] bg-[#222]"
    @scroll="store.galeryScrollPos = ($event.target as HTMLElement).scrollTop"
  >
    <div class="title-container">
      <h1>Ivan Riabov's photographs</h1>
    </div>
    <div>
      <ul>
        <li
          v-for="album in albums"
          :key="album.id"
          class="album-container"
          @click="active = album.id"
        >
          <div
            class="album-name-container"
          >
            <NuxtLink :to="`/album/${album.id}`">
              {{ album.name }}
            </NuxtLink>
          </div>
          <div class="album-row">
            <div
              v-for="(image, imgIndex) in album.images as unknown as GalImage[]"
              :key="image.id"
              :ref="(el) => functionRef(el, imgIndex)"
              class="album-row-item"
              :style="getImageStyle(album, image, imgIndex)"
              @pointerdown="pointerDown"
            >
              <a
                :href="`/detail/${image.id}`"
              >
                <img
                  :style="{ 'view-transition-name': image.id?.replace('/', '_') }"
                  :src="`/images/${image.pathname_thumb}`"
                  :alt="image.name"
                >
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.title-container {
  text-align: center;
  padding: 40px 10px;
  font-size: 33px;
}
.album-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
}
.album-name-container {
  font-size: 23px;
  padding: 10px;
  text-align: center;
  height: 200px;
  width: 200px;
  left: 30px;
  position: absolute;
  background-color: #888;
  box-shadow: 10px 0 30px 0 #000;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}
.album-row {
  flex: 1 1 auto;
  display: inline-block;
  overflow-x: hidden;
  overflow-y: hidden;
  height: 200px;
  width: 100%;
  white-space: nowrap;

  .album-row-item {
    display: inline-block;
    position: absolute;
    box-shadow: 10px 0 30px 0 #000;
    border-radius: 10px;
    overflow: hidden;
    transition: left 0.5s ease-in-out;
    user-select: none;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .album-row-item:hover {
    cursor: pointer;
    z-index: 100000 !important;
  }
}
</style>
