<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { useStore } from '~/store'
import type { GalImage } from '~~/types'

const bottomMenu = ref()
const imageEl = ref<HTMLImageElement>()
const magnifierEl = ref<HTMLElement>()
const imageContainer = ref<HTMLElement>()

// filter
const contrast = ref(100)
const blur = ref(0)
const saturate = ref(100)
const sepia = ref(0)

const filterUpdated = ref(false)

const { images, updateImage } = useFile()
const { loggedIn } = useUserSession()

const isSmallScreen = useMediaQuery('(max-width: 1024px)')
const { active, currentIndex, isFirstImg, isLastImg, initSwipe, magnifierImage } = useImageGallery()

// const route = useRoute()
const router = useRouter()

const store = useStore()

const image: ComputedRef<GalImage> = computed(() => {
  return images.value![currentIndex.value]!
})

const imagePrev: ComputedRef<GalImage | undefined> = computed(() => {
  return images.value![currentIndex.value - 1]
})

const imageNext: ComputedRef<GalImage | undefined> = computed(() => {
  return images.value![currentIndex.value + 1]
})

onKeyStroke('Escape', () => {
  router.push('/')
})

onKeyStroke('ArrowLeft', () => {
  if (isFirstImg.value) {
    router.push('/')
  }
  else {
    active.value = images.value[currentIndex.value - 1]?.id || ''
    router.push(`/detail/${images.value[currentIndex.value - 1]?.id}`)
  }
})

onKeyStroke('ArrowRight', () => {
  if (isLastImg.value) {
    router.push('/')
  }
  else {
    active.value = images.value[currentIndex.value + 1]?.id || ''
    router.push(`/detail/${images.value[currentIndex.value + 1]?.id}`)
  }
})

function resetFilter() {
  contrast.value = 100
  blur.value = 0
  saturate.value = 100
  sepia.value = 0
  filterUpdated.value = false
  store.enableMagnifier = false
  store.magnifierZoomFactor = 2
  store.borderH = 0
  store.borderV = 0
  store.colorFrame = '#000000'
}

const saveSettings = () => {
  image.value.presentationSettings = image.value.presentationSettings || {}
  image.value.presentationSettings.light = store.light
  image.value.presentationSettings.bluredBackground = store.enableBackgroundBlurLayer
  image.value.presentationSettings.shadow = store.enableFrameShadow

  image.value.presentationSettings.contrast = contrast.value
  image.value.presentationSettings.blur = blur.value
  image.value.presentationSettings.saturate = saturate.value
  image.value.presentationSettings.sepia = sepia.value

  image.value.presentationSettings.frameField = [store.borderV, store.borderH, store.borderV, store.borderH]
  image.value.presentationSettings.frameColor = store.colorFrame

  doUpdateImage()
}

const resetDefaultSettings = () => {
  image.value.presentationSettings = undefined
  doUpdateImage()
}

watch([contrast, blur, saturate, sepia], () => {
  filterUpdated.value = true
})

const exifData = ref< Record<string, { description: string }> | null>(null)

const exifText = computed(() => {
  const info: string[] = []
  if (exifData.value) {
    info.push(`Size: ${(exifData.value['ImageWidth'] || exifData.value['Image Width'])?.description} x ${(exifData.value['ImageLength'] || exifData.value['Image Height'])?.description}\n`)
    info.push(`Exposure: ${exifData.value['ExposureTime']?.description} ${exifData.value['FNumber']?.description} ISO ${exifData.value['ISOSpeedRatings']?.description}\n`)
    info.push(`Focal length: ${exifData.value['FocalLength']?.description}\n`)
    info.push('<br/>')
  }
  info.push(`Print size at 100 Dpi: ${Math.round(image.value.width * 2.54 / 10) / 10} cm x ${Math.round(image.value.height * 2.54 / 10) / 10} cm\n`)
  info.push(`Print size at 300 Dpi: ${Math.round(image.value.width * 2.54 / 30) / 10} cm x ${Math.round(image.value.height * 2.54 / 30) / 10} cm\n`)
  return info
})

const calcColors = () => {
  store.lightBaseColorRGB = `${store.light * 255}, ${store.light * 255}, ${store.light * 255}`
  store.lightBaseColor = `rgb(${store.lightBaseColorRGB})`
  const invert = Math.min(255 * (store.light < 0.6 ? store.light + 0.6 : store.light - 0.6), 255)
  const invertLow = Math.min(255 * (store.light < 0.6 ? store.light + 0.3 : store.light - 0.3), 255)
  store.lightHiCnstColorRGB = `${invert}, ${invert}, ${invert}`
  store.lightLowCnstColorRGB = `${invertLow}, ${invertLow}, ${invertLow}`

  const root = document.getElementById('root-vars')
  if (root) {
    root.innerHTML = `
      :root {
        --light: ${store.light};
        --light-base-color: ${store.lightBaseColor};
        --light-base-color-rgb: ${store.lightBaseColorRGB};
        --light-hi-cnst-color-rgb: ${store.lightHiCnstColorRGB};
      }`
  }
}
watch(() => store.light, () => {
  calcColors()
})

const doUpdateImage = useDebounceFn(() => {
  updateImage(image.value!.id, { presentationInfo: image.value!.presentationInfo, presentationSettings: image.value!.presentationSettings })
}, 1000)

onMounted(async () => {
  initSwipe(imageEl)
  exifData.value = image.value?.metadata as Record<string, { description: string }> | null
  applySettings()
  calcColors()
})

const applySettings = () => {
  if (image.value?.presentationSettings) {
    if (image.value.presentationSettings.light !== undefined) store.light = image.value.presentationSettings.light
    if (image.value.presentationSettings.shadow !== undefined) store.enableFrameShadow = image.value.presentationSettings.shadow
    if (image.value.presentationSettings.bluredBackground !== undefined) store.enableBackgroundBlurLayer = image.value.presentationSettings.bluredBackground
    if (image.value.presentationSettings.contrast !== undefined) contrast.value = image.value.presentationSettings.contrast
    if (image.value.presentationSettings.blur !== undefined) blur.value = image.value.presentationSettings.blur
    if (image.value.presentationSettings.saturate !== undefined) saturate.value = image.value.presentationSettings.saturate
    if (image.value.presentationSettings.sepia !== undefined) sepia.value = image.value.presentationSettings.sepia

    if (image.value.presentationSettings.frameField !== undefined) {
      store.borderV = image.value.presentationSettings.frameField[0]
      store.borderH = image.value.presentationSettings.frameField[1]
    }
    if (image.value.presentationSettings.frameColor !== undefined) store.colorFrame = image.value.presentationSettings.frameColor
    calcColors()
  }
}

watch(image, () => {
  applySettings()
})

const chip = computed(() => ({ backgroundColor: store.colorFrame }))

const imageCntStyle = computed(() => ({
  width: `auto`, // calc(100vw - var(--image-hor-pad))
  height: `-webkit-fill-available`,
  margin: `calc(var(--image-ver-pad) / 2) calc(var(--image-hor-pad) / 2)`,
  maxHeight: `fit-content`,
  border: `0px solid ${store.colorFrame}`,
  borderTopWidth: `${Math.round(store.borderV)}px`,
  borderBottomWidth: `${Math.round(store.borderV)}px`,
  borderLeftWidth: `${Math.round(store.borderH)}px`,
  borderRightWidth: `${Math.round(store.borderH)}px`,
  boxShadow: store.enableFrameShadow ? `0 0 40px 5px rgba(0, 0, 0, calc(0.75 - var(--light) * var(--light) / 2))` : `none`
}))

const imageStyle = computed(() => ({
  filter: `contrast(${contrast.value}%) saturate(${saturate.value}%) sepia(${sepia.value}%)`,
  viewTransitionName: image.value.id
}))
</script>

<template>
  <div
    v-if="image"
    id="page-detail"
    class="spa-page"
  >
    <!-- background -->
    <div
      class="absolute inset-0 w-full h-full transition-colors duration-200"
      :style="{ 'background-color': store.lightBaseColor }"
    >
      <!-- img
        :src="`/images/${image.pathname_thumb}`"
        class="object-cover w-full h-full blur-[70px] will-change-[filter] opacity-10"
        alt=""
-->
      <svg
        width="100%"
        height="100%"
        style="position: absolute; top: 0; left: 0; opacity: 0.2;"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter
          id="noiseFilter"
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="40"
            edgeMode="duplicate"
            result="blurImage"
          />
          <feTurbulence
            type="turbulence"
            baseFrequency="0.65"
            numOctaves="5"
            stitchTiles="stitch"
            result="colorNoise"
          />
          <feColorMatrix
            in="colorNoise"
            type="matrix"
            values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.5 0"
          />
          <feComposite
            operator="in"
            in2="SourceGraphic"
            result="monoNoise"
          />
          <feBlend
            in="blurImage"
            in2="monoNoise"
            mode="multiply"
          />
        </filter>
        <image
          v-if="store.enableBackgroundBlurLayer"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          filter="url(#noiseFilter)"
          :href="`/images/${image.pathname_thumb}`"
        />
        <rect
          v-else
          width="100%"
          height="100%"
          filter="url(#noiseFilter)"
          fill="var(--light-base-color)"
        />
      </svg>
    </div>

    <UtilWindow
      class="absolute z-50 top-[60px] w-[350px]"
      :class="store.maximizedInfo ? 'translate-x-0 left-8' : '-translate-x-full left-0'"
      @close="store.toggleMaximizedInfo()"
    >
      <template #title>
        Information
      </template>

      <TextInput
        v-if="loggedIn || image.presentationInfo?.title"
        :value="image.presentationInfo?.title"
        label="Title"
        :readonly="!loggedIn"
        @update:value="(value) => { (image.presentationInfo ? image.presentationInfo.title = value : image.presentationInfo = { title: value }); doUpdateImage() }"
      />

      <TextInput
        v-if="loggedIn || image.presentationInfo?.description"
        :value="image.presentationInfo?.description"
        label="Description"
        multiline
        :readonly="!loggedIn"
        @update:value="(value) => { (image.presentationInfo ? image.presentationInfo.description = value : image.presentationInfo = { description: value }); doUpdateImage() }"
      />
      <TextInput
        v-if="loggedIn || image.presentationInfo?.tags"
        label="Tags"
        multiline
        :readonly="!loggedIn"
        :value="image.presentationInfo?.tags?.join(',')"
        @update:value="(value) => { (image.presentationInfo ? image.presentationInfo.tags = value?.split(',').map((tag: string) => tag.trim()) : image.presentationInfo = { tags: value?.split(',').map((tag: string) => tag.trim()) }); doUpdateImage() }"
      />
      <TextInput
        v-if="loggedIn || image.presentationInfo?.author"
        label="Author"
        :readonly="!loggedIn"
        :value="image.presentationInfo?.author"
        @update:value="(value) => { (image.presentationInfo ? image.presentationInfo.author = value : image.presentationInfo = { author: value }); doUpdateImage() }"
      />
      <TextInput
        v-if="loggedIn || image.presentationInfo?.license"
        label="License"
        :readonly="!loggedIn"
        :value="image.presentationInfo?.license"
        @update:value="(value) => { (image.presentationInfo ? image.presentationInfo.license = value : image.presentationInfo = { license: value }); doUpdateImage() }"
      />
      <div class="flex flex-col mb-4 text-sm">
        <span style="color: var(--light-low-cnst-color);font-size: 18px;font-weight: 800;">EXIF</span>
        <span
          v-for="(line, index) in exifText"
          :key="index"
          style="padding-left: 16px;"
          v-html="line"
        />
      </div>
    </UtilWindow>

    <UtilWindow
      class="absolute top-[60px]"
      :class="store.showImageSettings ? 'translate-x-0 right-8' : 'translate-x-full right-0'"
      @close="store.toggleShowImageSettings()"
    >
      <template #title>
        Settings
      </template>
      <template #buttons>
        <UButton
          v-if="loggedIn"
          label="Save as default"
          color="primary"
          variant="outline"
          class="w-fit"
          @click="saveSettings"
        />
        <UButton
          v-if="loggedIn"
          label="Reset default"
          color="primary"
          variant="outline"
          :disabled="!image.presentationSettings"
          class="w-fit"
          @click="resetDefaultSettings"
        />
        <UButton
          label="Reset"
          color="primary"
          variant="outline"
          class="w-fit"
          @click="resetFilter"
        />
      </template>
      <div
        class="flex flex-col gap-y-12 pb-6"
      >
        <div
          class="flex flex-col gap-y-8"
          style="color: var(--light-hi-cnst-color)"
        >
          <!-- filters list -->
          <!--
            <div class="flex gap-x-4 justify-between items-center pb-4">
              <span class="text-white w-40">Fit</span>
              <USelectMenu
                v-model="objectFitSelected"
                :options="objectsFit"
                class="!w-52 mr-4"
              />
            </div>
-->
          <div class="flex gap-x-4 w-full justify-end pr-4">
            <UCheckbox
              v-model="store.enableMagnifier"
              name="magnifier"
              label="Magnifier"
              color="primary"
              class="items-center"
            />
            <UIcon
              name="i-heroicons-magnifying-glass-solid"
              class="w-5 h-5 transition-colors duration-200"
              style="color: var(--light-hi-cnst-color)"
            />
          </div>

          <UGauge
            v-model="store.magnifierZoomFactor"
            :disabled="!store.enableMagnifier"
            :min="2"
            :max="10"
            title="Zoom level"
          />
          <UGauge
            v-model="sepia"
            :max="100"
            title="Sepia"
          />
          <!-- UGauge
            v-model="hueRotate"
            :max="180"
            title="Hue-rotate"
          / -->
          <UGauge
            v-model="saturate"
            :max="200"
            title="Saturate"
          />
          <!-- UGauge
            v-model="invert"
            :max="100"
            title="Invert"
          / -->
          <UGauge
            v-model="contrast"
            :min="50"
            :max="200"
            title="Contrast"
          />
          <UGauge
            v-model="blur"
            :max="20"
            title="Blur"
          />

          <UGauge
            v-model="store.light"
            title="Light"
            :max="1"
            :shortcuts="['U', 'D']"
            icon="i-heroicons-sun"
          />

          <UCheckbox
            v-model="store.enableBackgroundBlurLayer"
            name="backgroundBlurLayer"
            label="Background blured image"
            color="primary"
            class="items-center"
          />
          <UCheckbox
            v-model="store.enableFrameShadow"
            name="frameShadow"
            label="Frame's shadow"
            color="primary"
            class="items-center"
          />

          <UGauge
            v-model="store.borderV"
            title="Frame vertical"
            :max="300"
            icon="i-heroicons-sun"
          />

          <UGauge
            v-model="store.borderH"
            title="Frame horizontal"
            :max="400"
            icon="i-heroicons-sun"
          />

          <UPopover>
            <UButton
              label="Frame color"
              variant="ghost"
            >
              <template #leading>
                <span
                  :style="{ ...chip, border: `1px solid var(--light-low -cnst-color)` }"
                  class="size-6 rounded-full"
                />
              </template>
            </UButton>

            <template #content>
              <UColorPicker
                v-model="store.colorFrame"
                size="xl"
                class="p-2 rounded-md overflow-hidden"
                style="background-color: var(--light-base-color)"
              />
            </template>
          </UPopover>
        </div>
      </div>
    </UtilWindow>

    <div class="h-full w-full flex items-center justify-center relative mx-auto">
      <!-- Bottom menu -->
      <BottomMenu
        ref="bottomMenu"
        class="bottom-menu"
        :class="{ }"
      >
        <template #description />
        <template #prepend>
          <!-- previous image if not the first image -->
          <UTooltip
            v-if="!isFirstImg"
            text="Previous"
            :kbds="['←']"
          >
            <UButton
              variant="ghost"
              :to="`/detail/${images![currentIndex - 1]?.id}`"
              size="lg"
              icon="i-heroicons-chevron-left"
              class="bottom-menu-button-tr"
              aria-label="Go to previous image"
              @click="active = images![currentIndex - 1]?.id, console.log(active)"
            />
          </UTooltip>

          <UTooltip
            v-else
            text="Back to gallery"
            :kbds="['Esc']"
          >
            <UButton
              to="/"
              size="lg"
              icon="i-heroicons-rectangle-group-20-solid"
              variant="ghost"
              class="bottom-menu-button-tr"
              aria-label="Back to gallery"
            />
          </UTooltip>
        </template>
        <!-- Filters -->
        <template #buttons>
          <div class="bottom-menu-button">
            <div
              class="flex gap-x-2 items-center"
            >
              <!-- back to gallery (desktop & not the first or last image) -->
              <UTooltip
                v-if="!(isFirstImg || isLastImg) || isSmallScreen"
                text="Back to gallery"
                :kbds="['Esc']"
              >
                <UButton
                  variant="ghost"
                  to="/"
                  size="md"
                  aria-label="Back to gallery"
                  class="bottom-button"
                >
                  <div
                    class="image-icon"
                    style="transform: scale(1.5);"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 512 512"
                    ><path d="M276.148-12.002c-75.859.011-151.718-.003-227.577.032-4.617.052-9.263-.199-13.842.538C19.523-9.218 5.383-.309-2.99 12.603-9.278 22.111-12.431 33.617-11.988 45l.04 149.187c.558 17.047 9.734 33.548 23.901 43.041 9.641 6.57 21.417 9.88 33.066 9.433l234.017-.03c16.936-.403 33.418-9.306 43.054-23.238 6.86-9.741 10.357-21.763 9.901-33.661l-.046-149.36c-.596-16.97-9.717-33.388-23.804-42.869C298.8-8.866 287.456-12.256 276.15-12zm191.995 0c-21.935.037-43.871-.072-65.805.09-17.021.818-33.379 10.211-42.658 24.507-6.277 9.492-9.431 20.974-9.004 32.338l.046 149.368c.598 16.973 9.725 33.394 23.817 42.872 9.666 6.611 21.489 9.943 33.181 9.487l64.552-.08c17.129-.798 33.589-10.297 42.857-24.724 6.233-9.521 9.322-21.016 8.862-32.377l-.047-149.11c-.596-16.974-9.721-33.394-23.814-42.873-9.34-6.366-20.682-9.755-31.988-9.498zM105.504 265.33c-21.913.031-43.827-.065-65.738.088-16.984.782-33.318 10.111-42.636 24.331-6.382 9.57-9.572 21.183-9.122 32.667l.048 149.206c.593 17.03 9.779 33.505 23.946 42.971 9.648 6.562 21.43 9.859 33.079 9.399l64.538-.08c17.176-.807 33.68-10.359 42.93-24.856 6.147-9.456 9.214-20.839 8.775-32.101l-.047-149.261c-.601-17.112-9.879-33.658-24.164-43.099-9.263-6.215-20.455-9.511-31.61-9.265zm362.695.002c-78.448.013-156.896-.016-235.344.041-17.086.444-33.69 9.539-43.265 23.697-6.686 9.694-10.043 21.588-9.583 33.343l.048 149.212c.595 17.013 9.762 33.469 23.905 42.942 9.658 6.575 21.455 9.885 33.121 9.425l234.194-.035c17.177-.481 33.837-9.721 43.361-24.022 6.532-9.639 9.818-21.395 9.356-33.021l-.048-149.212c-.595-17.001-9.754-33.445-23.881-42.918a55 55 0 0 0-31.864-9.452z" /></svg>
                  </div>
                </UButton>
              </UTooltip>
              <!-- open filters -->
              <UTooltip
                v-if="!isSmallScreen"
                text="Show information"
                :kbds="['i']"
              >
                <UButton
                  variant="ghost"
                  size="md"
                  class="bottom-button"
                  aria-label="Show information"
                  @click="store.toggleMaximizedInfo()"
                >
                  <div
                    class="image-icon"
                    style="transform: scale(2) translate(0px, 5px);"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40px"
                      height="40px"
                    ><path d="M23.945 11.998A11.931 11.945 0 1 1 12.014.052a11.944 11.958 0 0 1 11.931 11.945zm-9.942 0a1.989 1.991 0 0 0-1.989-1.991h-1.989v1.991h1.989v6.968h1.989zM12.014 5.03a1.491 1.493 0 1 0 1.491 1.493 1.491 1.493 0 0 0-1.491-1.493z" /></svg>
                  </div>
                </UButton>
              </UTooltip>
              <!-- v-if="loggedIn"  -->
              <UTooltip
                text="Presentation settings"
                :kbds="['S']"
              >
                <UButton
                  variant="ghost"
                  size="md"
                  aria-label="Presentation settings"
                  class="bottom-button hidden"
                  @click="store.toggleShowImageSettings()"
                >
                  <div
                    class="image-icon"
                    style="transform: scale(1.25) translate(-5px, 5px);"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-5 -10 64 64"
                      width="30px"
                      height="30px"
                    ><path d="M57.117 28.641l-5.139-4.481c.099-1.247.099-2.513.009-3.769 0-.054 0-.108-.009-.162l-.069-.727 4.987-4.64a1.76 1.76 0 0 0 .482-1.783c-.682-2.288-1.645-4.541-2.881-6.677-.329-.574-.957-.912-1.63-.873l-6.814.461c-.491-.583-1.026-1.149-1.591-1.699-.559-.544-1.149-1.056-1.747-1.532l.236-6.832c.024-.667-.338-1.286-.927-1.609-2.175-1.158-4.448-2.052-6.76-2.656-.652-.176-1.325.039-1.768.535l-4.496 5.145a24.63 24.63 0 0 0-4.625.069l-4.655-4.993c-.461-.482-1.149-.673-1.783-.482-2.288.682-4.541 1.645-6.677 2.881-.574.329-.918.966-.873 1.639l.461 6.808-1.699 1.591-1.541 1.747-6.823-.236c-.658-.039-1.286.338-1.609.927-1.158 2.175-2.052 4.448-2.656 6.76-.176.643.039 1.331.535 1.768l5.139 4.481-.054.727v.153c-.054 1.262-.009 2.528.123 3.769l-4.987 4.649c-.482.461-.673 1.149-.482 1.783.682 2.297 1.645 4.541 2.881 6.677.03.06.078.123.123.176v.009.009a1.8 1.8 0 0 0 .613.506c.275.138.583.2.903.182l6.814-.461.865.957.721.736 1.738 1.532-.236 6.823c-.03.729.417 1.349.972 1.633 2.166 1.149 4.427 2.046 6.731 2.65.467.114 1.223.053 1.756-.55l4.487-5.139.55.039c1.179.069 2.366.054 3.506-.054l.583-.06 4.649 4.993c.452.482 1.14.673 1.783.482 2.288-.673 4.535-1.645 6.677-2.881.525-.303.929-.899.889-1.645l-.461-6.808 1.684-1.591.673-.727.859-1.011 6.832.236c.523.05 1.294-.273 1.627-.96 1.158-2.166 2.052-4.433 2.65-6.74.168-.631-.045-1.313-.544-1.756zm-22.46.94c-3.777 3.896-10.022 3.969-13.884.222-3.887-3.765-3.989-9.995-.222-13.884s9.995-3.989 13.884-.222a9.82 9.82 0 0 1 .222 13.883z" /></svg>
                  </div>
                </UButton>
              </UTooltip>
              <!-- open original -->
              <!--
              <UTooltip text="Open in a new tab">
                <UButton
                  variant="ghost"
                  icon="i-heroicons-arrow-up-right-20-solid"
                  size="md"
                  :to="`/images/${image.pathname}`"
                  target="_blank"
                  class="bottom-button"
                  aria-label="Open original image"
                />
              </UTooltip>
              -->
              <!-- download original or modified image -->
              <UTooltip text="Download">
                <a
                  :href="`/images/${image.pathname}`"
                  download
                >
                  <UButton
                    variant="ghost"
                    size="md"
                    class="bottom-button hidden"
                    aria-label="Download original or modified image"
                  >
                    <div
                      class="image-icon"
                      style="transform: scale(2.0) translate(0px, -2px);"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                      ><path d="M14 7.015V.474l7.54 7.54H15a1 1 0 0 1-1-1zm7.976 3H15c-1.654 0-3-1.346-3-3V.038L4.688.014C3.046.015 2.396.906 2.402 2.187l-.075 19.324c-.023 1.003.578 2.204 1.981 2.266 1.315.058 14.366.046 15.699.057 1.245-.004 1.98-.756 1.972-2.117zm-6.104 7.671L14.259 19.3c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.91-.943.471-2.324 1.414-1.414l1.293 1.293v-4.398c0-1.333 2-1.333 2 0v4.398l1.293-1.293c.943-.91 2.324.471 1.414 1.414z" /></svg>
                    </div>
                  </UButton>
                </a>
              </UTooltip>
            </div>
          </div>
        </template>
        <template #append>
          <UTooltip
            v-if="!isLastImg"
            text="Next"
            :kbds="['→']"
          >
            <UButton
              variant="ghost"
              :to="`/detail/${images![currentIndex + 1]?.id}`"
              size="lg"
              icon="i-heroicons-chevron-right"
              aria-label="Go to next image"
              class="bottom-menu-button-tr"
              @click="active = images![currentIndex + 1]?.id, console.log(active)"
            />
          </UTooltip>

          <!-- back to gallery if last image -->
          <UTooltip
            v-else
            text="Back to gallery"
            :kbds="['Esc']"
          >
            <UButton
              variant="ghost"
              to="/"
              size="lg"
              icon="i-heroicons-rectangle-group-20-solid"
              class="bottom-menu-button-tr"
              aria-label="Back to gallery"
            />
          </UTooltip>
        </template>
      </BottomMenu>

      <div
        class="absolute"
        :style="{ 'left': '0', 'top': 'calc(50% - 150px)', 'width': '300px', 'height': '300px', 'view-transition-name': imagePrev?.id }"
      />
      <div
        class="absolute"
        :style="{ 'right': '0', 'top': 'calc(50% - 150px)', 'width': '300px', 'height': '300px', 'view-transition-name': imageNext?.id }"
      />
      <div
        class="group transition-all duration-200 flex items-center justify-center w-full h-full relative"
      >
        <div class="flex items-center justify-center md:justify-between gap-x-4 w-full h-full">
          <!-- image -->
          <div class="relative flex items-center justify-center w-full h-full">
            <div
              ref="imageContainer"
              class="flex items-center justify-center w-full h-full"
            >
              <div
                class="image-field overflow-hidden flex items-center justify-center relative"
                :style="imageCntStyle"
              >
                <img
                  v-if="image"
                  ref="imageEl"
                  :src="`/images/${image.pathname_preview}`"
                  :alt="image.name"
                  class="object-contain block shadow-md max-w-full max-h-full"
                  :style="imageStyle"
                  @mousemove="store.enableMagnifier ? magnifierImage($event, imageContainer!, imageEl!, magnifierEl!, store.magnifierZoomFactor, 200) : () => {}"
                >
                <div
                  class="absolute pointer-events-none z-5 w-full h-full bg-transparent"
                  :style="`backdrop-filter: blur(${blur}px);`"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="store.enableMagnifier"
          ref="magnifierEl"
          class="absolute border border-gray-200 pointer-events-none rounded-full block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-no-repeat bg-black"
          :style="`width: ${store.loupeSize}px; height: ${store.loupeSize}px; background-image: url('/images/${image.pathname}'`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.image-field{
  --image-ver-pad: 300px;
  --image-hor-pad: 32px;
}
@media screen and (max-width: 1000px) {
  .image-field{
    --image-ver-pad: 160px;
    --image-hor-pad: 32px;
  }
}
.bottom-menu{
  .bottom-menu-button{
    color: var(--light-hi-cnst-color);
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;

    :deep(.bottom-button){
      display: flex;
      background-color: var(--light-base-color);
      border-radius: 999px;
      border: 4px solid var(--light-base-color);
      width: 40px;
      height: 40px;
      color: var(--light-hi-cnst-color);
      align-items: center;
      justify-content: center;
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
      fill: currentColor;
      overflow: hidden;
    }
    :deep(.bottom-button:hover){
      border: 1px solid var(--light-base-color);
      outline: 3px solid var(--light-hi-cnst-color);
    }
    :deep(.bottom-button .image-icon){
      transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    :deep(.bottom-button:hover .image-icon){
      transform: scale(1) translate(0px, 0px) !important;
    }
  }
  .bottom-menu-button-tr{
    color: var(--light-hi-cnst-color);
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }
}
</style>

<style>
@keyframes slide-to-left {
  to {
    transform: translateX(0px);
  }
}
</style>
