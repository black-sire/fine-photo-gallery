import { createError } from 'h3'
import type { FilePlugin, GalImage, GalAlbum, GalImageInfo } from '../../types'

export default defineNuxtPlugin(() => {
  const albums = ref(new Map<string, GalAlbum>())
  const catalog = ref<GalImage[]>([])
  const catalogIsLoaded = ref(false)

  const router = useRouter()
  const toast = useToast()
  const onLoadCallbacks = ref<((albums: GalAlbum[], catalog: GalImage[]) => void)[]>([])
  const onCatalogLoad = (func: (albums: GalAlbum[], catalog: GalImage[]) => void) => {
    if (catalogIsLoaded.value) {
      func(Array.from(albums.value.values()), catalog.value)
    }
    onLoadCallbacks.value.push(func)
  }
  const useUpload = (apiBase: string, options = {}) => {
    const { formKey = 'files', multiple = true, method = 'POST', ...fetchOptions }: { formKey?: string, multiple?: boolean, method?: string, [key: string]: unknown } = options || {}
    const upload = async (data: File | FileList | File[]) => {
      let files: File[]
      if (typeof FileList !== 'undefined' && data instanceof FileList) {
        files = Array.from(data)
      }
      else if (data instanceof File) {
        files = [data]
      }
      else {
        files = Array.isArray(data) ? data : []
      }
      if (!files || !files.length) {
        throw createError({ statusCode: 400, message: 'Missing files' })
      }
      const formData = new FormData()
      if (multiple) {
        for (const file of files) {
          formData.append(formKey, file)
        }
      }
      else {
        formData.append(formKey, files[0] as Blob)
      }
      return $fetch(apiBase, {
        ...fetchOptions,
        method: method as 'POST' | 'GET' | 'HEAD' | 'PATCH' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE',
        body: formData
      }).then(result => multiple === false || data instanceof File ? (result as unknown[])[0] : result)
    }
    return upload
  }

  const upload = useUpload('/api/images/upload', { multiple: false, timeout: 120000 })

  async function loadCatalog() {
    const [albums_data, catalog_data] = await Promise.all([useFetch('/api/albums'), useFetch('/api/images')])
    catalog.value = catalog_data.data.value as GalImage[]
    albums.value.clear()
    albums_data.data.value?.forEach((album: GalAlbum) => {
      albums.value.set(album.id, album)
      album.images = catalog.value?.filter((image: unknown) => (image as GalImage).albumId === album.id) || []
    })
    catalogIsLoaded.value = true
    onLoadCallbacks.value.forEach(callback => callback(Array.from(albums.value.values()), catalog.value))
  }

  const getImages = (albumId: string) => {
    if (!catalogIsLoaded.value)
      return []
    const images = albums.value.get(albumId)?.images || []
    return images as GalImage[]
  }

  const getAlbums = () => {
    if (!catalogIsLoaded.value)
      return []
    return Array.from(albums.value.values())
  }

  async function updateImage(id: string, image: GalImageInfo) {
    await $fetch(`/api/images/${id}`, { method: 'POST', body: image })
  }

  async function uploadImage(image: File, filter: boolean = false) {
    await upload(image).catch(err => toast.add({
      color: 'error',
      title: 'Failed to upload image',
      description: err.data?.message || err.message
    }))

    loadCatalog()

    if (filter) {
      router.push('/')
    }
  }

  async function deleteImage(pathname: string) {
    await $fetch(`/api/images/${pathname}`, { method: 'DELETE' })

    loadCatalog()
  }

  loadCatalog()

  return {
    provide: {
      file: {
        catalogIsLoaded,
        loadCatalog,
        onCatalogLoad,
        getImages,
        getAlbums,
        uploadImage,
        deleteImage,
        updateImage
      } as FilePlugin
    }
  }
})
