export type PresentationSettings = {
  light?: number
  blur?: number
  sepia?: number
  saturate?: number
  contrast?: number
  shadow?: boolean
  bluredBackground?: boolean
  crop?: [number, number, number, number]
  frameField?: [number, number, number, number]
  frameColor?: string
}

export type PresentationInfo = {
  title?: string
  description?: string
  author?: string
  copyright?: string
  license?: string
  tags?: string[]
  isHidden?: boolean
}

export type GalImageInfo = {
  presentationInfo?: PresentationInfo
  presentationSettings?: PresentationSettings
}

export type GalImageEntity = {
  id: string
  albumId: string
  name: string
  pathname: string
  pathname_preview: string
  pathname_thumb: string
}

export type GalImage = GalImageEntity & {
  contentType: string
  size: number
  aspectRatio: number
  width: number
  height: number
  createdAt?: number
  updatedAt: number
  metadata?: ExifReader.Tags
} & GalImageInfo

export interface FilePlugin {
  getImages: () => Promise<void>
  images: Ref<GalImage[]>
  updateImage: (id: string, image: GalImageInfo) => Promise<void>
  uploadImage: (image: File, filter?: boolean) => Promise<void>
  deleteImage: (pathname: string) => Promise<void>
}
