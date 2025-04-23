import { createError } from 'h3'
import type { FilePlugin, GalImage } from '../../types'

export default defineNuxtPlugin(() => {
  const images = ref()
  const router = useRouter()
  const toast = useToast()

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

  async function getImages(albumId: string = 'common') {
    const { data: files } = await useFetch('/api/images', { params: { albumId } })

    images.value = files.value
  }

  async function updateImage(id: string, image: GalImage) {
    await $fetch(`/api/images/${id}`, { method: 'POST', body: image })
  }

  async function uploadImage(image: File, filter: boolean = false) {
    await upload(image).catch(err => toast.add({
      color: 'red',
      title: 'Failed to upload image',
      description: err.data?.message || err.message
    }))

    getImages()

    if (filter) {
      router.push('/')
    }
  }

  async function deleteImage(pathname: string) {
    await $fetch(`/api/images/${pathname}`, { method: 'DELETE' })

    getImages()
  }

  return {
    provide: {
      file: {
        getImages,
        images,
        uploadImage,
        deleteImage,
        updateImage
      } as FilePlugin
    }
  }
})
