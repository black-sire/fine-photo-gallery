<script setup lang="ts">
import { useStore } from '~/store'
import type { GalImage } from '~~/types'

const isOpen = ref(false)

const dropZoneRef = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const mansoryItem = ref<Array<HTMLElement>>([])
const deletingImg = ref('')
const uploadingImg = ref(false)
const disconnect = ref(false)

const toast = useToast()
const { uploadImage, deleteImage, catalogIsLoaded, getImages } = useFile()
const { loggedIn, clear } = useUserSession()

const store = useStore()
const { active, albumId } = useImageGallery()

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)

function openFilePicker() {
  fileInput.value?.click()
}

const images = computed(() => getImages(albumId))
const imageTargetSize = ref(300)
const imageMaxSize = ref(400)

const imageScale = (image: GalImage) => Math.sqrt(image.aspectRatio)
const imageHPad = ref(40)
const imageVPad = ref(50)

async function fileSelection(event: Event) {
  const target = event.target as HTMLInputElement

  if (target.files?.[0]) {
    await uploadFile(target.files[0])
  }
}

async function onDrop(files: File[] | null) {
  if (files) {
    await uploadFile(files[0] as File)
  }
}

async function uploadFile(file: File) {
  uploadingImg.value = true

  await uploadImage(file)
    .catch(() => toast.add({ title: 'An error occured', description: 'Please try again', color: 'warning' }))
    .finally(() => uploadingImg.value = false)
}

async function deleteFile(id: string) {
  deletingImg.value = id

  await deleteImage(id)
    .catch(() => toast.add({ title: 'An error occured', description: 'Please try again', color: 'warning' }))
    .finally(() => deletingImg.value = '')
}

async function clearSession() {
  disconnect.value = true

  await clear().finally(() => disconnect.value = false)
}

onMounted(async () => {
  dropZoneRef.value?.scrollTo({ top: store.galeryScrollPos })
  setTimeout(() => {
    dropZoneRef.value?.scrollTo({ top: store.galeryScrollPos })
  }, 50)
})
</script>

<template>
  <section
    v-if="catalogIsLoaded"
    ref="dropZoneRef"
    class="relative h-screen gap-[22px] overflow-auto"
    @scroll="store.galeryScrollPos = ($event.target as HTMLElement).scrollTop"
  >
    <BottomMenu
      class="bottom-menu"
    >
      <template #description />
      <template #buttons>
        <div class="flex gap-x-2">
          <UButton
            v-if="loggedIn"
            :loading="disconnect"
            icon="i-heroicons-power-20-solid"
            color="warning"
            variant="ghost"
            @click="clearSession"
          />
          <UModal v-else>
            <UButton
              label="Sign in"
              color="neutral"
              variant="ghost"
              aria-label="Sign in"
              class="mr-4 sm:mr-0"
              @click="isOpen = true"
            />
            <template #content>
              <LoginForm class="z-50 bg-gray-800 rounded-md" />
            </template>
          </UModal>
        </div>
      </template>
    </BottomMenu>

    <div
      class="w-full"
      :class="{ 'masonry-container': images && images.length }"
    >
      <ul
        class="flex flex-row flex-wrap align-start"
      >
        <li
          v-for="image in images"
          ref="mansoryItem"
          :key="image.id"
          class="relative group masonry-item flex-auto flex items-center justify-center"
        >
          <UButton
            v-if="loggedIn"
            :loading="deletingImg === image.id"
            color="neutral"
            icon="i-heroicons-trash-20-solid"
            style="top: calc(100% - var(--image-v-pad) + 10px); right: calc(50% - 16px); color: #A44"
            class="absolute z-[9999] opacity-0 group-hover:opacity-100"
            @click="deleteFile(image.id)"
          />
          <NuxtLink
            :to="`/detail/${image.id}`"
            @click="active = image.id"
          >
            <img
              v-if="image"
              :src="`/images/${image.pathname_thumb}`"
              class="h-auto w-full rounded-md transition-all duration-200 will-change-[filter] object-contain"
              :style="`view-transition-name: ${image.id?.replace('/', '_')};min-width: ${imageTargetSize*imageScale(image)}px;min-height: ${imageTargetSize*imageScale(image)/image.aspectRatio}px;`"
            >
          </NuxtLink>
        </li>
        <li
          v-if="loggedIn"
          style="max-height: var(--image-max-height); min-width: var(--image-max-height);flex:10000000;"
        >
          <input
            ref="fileInput"
            class="hidden"
            type="file"
            accept="image/*"
            @change="fileSelection"
          >
          <UploadButton
            :uploading="uploadingImg"
            type="submit"
            class="mb-6"
            :is-over-drop-zone="isOverDropZone"
            @click="openFilePicker"
          />
        </li>
      </ul>
    </div>
  </section>
  <div
    v-else
    class="flex items-center space-x-4 z-10"
  >
    <USkeleton
      class="h-12 w-12 bg-primary-500"
      :ui="{ rounded: 'rounded-full' }"
    />
    <div class="space-y-2">
      <USkeleton class="h-4 w-[250px] bg-primary-500" />
      <USkeleton class="h-4 w-[200px] bg-primary-500" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .imageEl {

  }

  @media (min-width: 768px) {
    .container-image {
    background-color: rgba(255, 255, 255, 0.1)
  }
  .container-image:hover {
    background-color: transparent;
  }
}

.masonry-container {
  --image-max-height: v-bind(imageMaxSize + 'px');
  --image-max-width: v-bind(imageMaxSize + 'px');
  --image-h-pad: v-bind(imageHPad + 'px');
  --image-v-pad: v-bind(imageVPad + 'px');
  ul {
    /*
    column-gap: calc(max(2em, 5vw));
    row-gap: calc(max(4em, 10vh));
    */
    li{
      min-height: calc(var(--image-max-height) + var(--image-v-pad) * 2);
      min-width: calc(var(--image-max-width) + var(--image-h-pad) * 2);
      padding-top: var(--image-v-pad);
      padding-bottom: var(--image-v-pad);
      padding-left: var(--image-h-pad);
      padding-right: var(--image-h-pad);

      img{
        object-fit: contain;
      }
    }
  }
}
@media screen and (max-width: 1024px) {
  .masonry-container {
    column-fill: balance;
    ul{
      li{
        padding-top: 4em;
        padding-bottom: 4em;
        padding-left: 0;
        padding-right: 0;
        min-width: min(calc(var(--image-max-width) + var(--image-h-pad)), 100vw);
        max-width: 100%;
        margin: 0;
      }
    }
  }

  .masonry-item, .upload {
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
