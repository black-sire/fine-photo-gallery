import type { UseSwipeDirection } from '@vueuse/core'
import type { BlobObject } from '@nuxthub/core'
import type { FilePlugin, GalImage } from '../../types'

export function useImageGallery() {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const imageToDownload = ref<HTMLImageElement>()
  const router = useRouter()
  const route = useRoute()

  const file = nuxtApp.$file as FilePlugin

  let albumId = route.params.slug?.[0]
  if (route.path.startsWith('/detail/')) {
    const index = route.path.indexOf('/', 8)
    albumId = route.path.substring(8, index)
  }

  const images = file.getImages(albumId)

  const currentIndex: ComputedRef<number> = computed(() => images.findIndex((image: GalImage) => image.id === route.params.slug?.join('/')))
  const isFirstImg: ComputedRef<boolean> = computed(() => images[0]?.id === route.params.slug?.join('/') || false)
  const isLastImg: ComputedRef<boolean> = computed(() => images[images.length - 1]?.id === route.params.slug?.join('/') || false)
  const nextImage = computed(() => images[currentIndex.value + 1])
  const prevImage = computed(() => images[currentIndex.value - 1])
  const image = computed(() => images[currentIndex.value])

  const initSwipe = (el: Ref<HTMLImageElement | undefined>) => {
    useSwipe(el, {
      passive: false,

      onSwipeEnd(e: TouchEvent, direction: UseSwipeDirection) {
        if (direction === 'left') {
          if (isLastImg.value)
            router.push('/')
          else
            router.push(`/detail/${images[currentIndex.value + 1]?.id}`)
        }
        else {
          if (isFirstImg.value)
            router.push('/')
          else
            router.push(`/detail/${images[currentIndex.value - 1]?.id}`)
        }
      }
    })
  }

  const applyFilters = async (poster: HTMLImageElement, contrast: number, blur: number, invert: number, saturate: number, hueRotate: number, sepia: number) => {
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d')

    canvas.width = poster?.naturalWidth
    canvas.height = poster?.naturalHeight

    context!.filter = `contrast(${contrast}%) blur(${blur}px) invert(${invert}%)
      saturate(${saturate}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%)`

    context!.drawImage(poster!, 0, 0, canvas.width, canvas.height)

    const modifiedImage = new Image()

    modifiedImage.src = canvas.toDataURL('image/png')
    imageToDownload.value = modifiedImage

    return imageToDownload as Ref<HTMLImageElement>
  }

  const downloadImage = async (filename: string, poster: HTMLImageElement, contrast: number, blur: number, invert: number, saturate: number, hueRotate: number, sepia: number) => {
    await applyFilters(poster, contrast, blur, invert, saturate, hueRotate, sepia)

    if (!imageToDownload.value) {
      return
    }

    await useFetch(imageToDownload.value.src, {
      baseURL: `${config.public.imageApi}/ipx/_/tmdb/`
    }).then((response) => {
      const blob = response.data.value as Blob
      const url: string = URL.createObjectURL(blob)
      const link: HTMLAnchorElement = document.createElement('a')

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.click()
    })
  }

  const convertBase64ToFile = async (image: Ref<HTMLImageElement>, originalImage: Ref<BlobObject>) => {
    const url = image.value.currentSrc

    const response = await fetch(url)
    const blob = await response.blob()

    const convertedFile = new File([blob], `${Math.random().toString().split('.')[1]}.${originalImage.value?.contentType?.split('/').pop()}`, { type: originalImage.value.contentType })

    return convertedFile as File
  }

  const magnifierImage = (e: MouseEvent, containerEl: HTMLElement, imageEl: HTMLImageElement, magnifierEl: HTMLElement, zoomFactor: number = 2, loupeSize: number = 200) => {
    if (magnifierEl.style.filter !== imageEl.style.filter)
      magnifierEl.style.filter = imageEl.style.filter

    const imageRect = imageEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()

    const x = e.pageX - imageRect.left
    const y = e.pageY - imageRect.top

    const imgWidth = imageRect.width
    const imgHeight = imageRect.height

    const zoomedWidth = imgWidth * zoomFactor
    const zoomedHeight = imgHeight * zoomFactor

    let xperc = (x / imgWidth) * 100
    let yperc = (y / imgHeight) * 100

    const ox = loupeSize / zoomedWidth
    const oy = loupeSize / zoomedHeight

    xperc = 50 + (xperc - 50) * (1 + ox)
    yperc = 50 + (yperc - 50) * (1 + oy)

    magnifierEl.style.backgroundSize = `${zoomedWidth}px ${zoomedHeight}px`
    magnifierEl.style.backgroundPositionX = `${xperc}%`
    magnifierEl.style.backgroundPositionY = `${yperc}%`
    magnifierEl.style.left = `${e.pageX - containerRect.left - loupeSize}px`
    magnifierEl.style.top = `${e.pageY - containerRect.top - loupeSize}px`
    magnifierEl.style.zIndex = '9999'
  }

  return {
    albumId,
    downloadImage,
    applyFilters,
    convertBase64ToFile,
    magnifierImage,
    initSwipe,
    currentIndex,
    isFirstImg,
    isLastImg,
    nextImage,
    prevImage,
    image
  }
}
