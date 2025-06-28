import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import ExifReader from 'exifreader'
import type { GalImage, GalImageInfo } from '~~/types'

const GALLERY_FOLDER = process.env.GALLERY_FOLDER || './data'
const galinfo_file = path.join(GALLERY_FOLDER, 'gallery_info.json')
const albums_file = path.join(GALLERY_FOLDER, 'albums_list.json')

const CACHE_TTL = 24 * 3600000 // 24 hours
const cache = {
  catalog: [] as GalImage[],
  albums: [] as GalAlbum[],
  lastSync: 0,
  lastAccess: 0,
  albumsLastSync: 0,
  albumsLastAccess: 0
}

const addImageToCatalog = (img: GalImage) => {
  return new Promise((resolve, reject) => {
    getCatalog().then((catalog) => {
      catalog.push(img)
      flushCatalog().then(resolve).catch(reject)
    })
  })
}

const removeFromCatalog = (id: string) => {
  return new Promise((resolve, reject) => {
    getCatalog().then((catalog) => {
      const index = catalog.findIndex((image: GalImage) => image.id === id)
      if (index !== -1) {
        catalog.splice(index, 1)
        flushCatalog().then(resolve).catch(reject)
      }
      else {
        reject('Image not found')
      }
    })
  })
}

const getCatalog = () => {
  if ((Date.now() - cache.lastSync) < CACHE_TTL) {
    cache.lastAccess = Date.now()
    return Promise.resolve(cache.catalog)
  }
  return new Promise<GalImage[]>((resolve, reject) => {
    if (fs.existsSync(galinfo_file)) {
      fs.readFile(galinfo_file, 'utf8', function (err, data) {
        if (err) return reject(err)
        const catalog = JSON.parse(data) as GalImage[]
        cache.catalog = catalog
        cache.lastSync = Date.now()
        resolve(catalog)
      })
    }
    else {
      cache.catalog = []
      cache.lastSync = Date.now()
      resolve([] as GalImage[])
    }
  })
}

const getAlbumsList = () => {
  if ((Date.now() - cache.albumsLastSync) < CACHE_TTL) {
    cache.albumsLastAccess = Date.now()
    return Promise.resolve(cache.albums)
  }
  return new Promise<GalAlbum[]>((resolve, reject) => {
    if (fs.existsSync(albums_file)) {
      fs.readFile(albums_file, 'utf8', function (err, data) {
        if (err) return reject(err)
        const albums = JSON.parse(data) as GalAlbum[]
        cache.albums = albums
        cache.albumsLastSync = Date.now()
        resolve(albums)
      })
    }
    else {
      cache.albums = []
      cache.albumsLastSync = Date.now()
      resolve([] as GalAlbum[])
    }
  })
}

const flushCatalog = () => {
  return new Promise<void>((resolve, reject) => {
    if (!fs.existsSync(GALLERY_FOLDER))
      fs.mkdirSync(GALLERY_FOLDER)
    fs.writeFile(galinfo_file, JSON.stringify(cache.catalog, null, 2), 'utf8', function (err) {
      if (err) return reject(err)
      cache.lastSync = Date.now()
      resolve()
    })
  })
}

const uploadImages = async (files: File[], albumId: string) => {
  const objects: GalImage[] = []
  try {
    const catalog = await getCatalog()

    fs.mkdirSync(path.join(GALLERY_FOLDER, albumId), { recursive: true })
    for (const file of files) {
      const name = file.name
      const id = `${albumId}/${name.split('.')[0]}`
      if (catalog.some(i => i.id === id)) continue

      const pathname = `${albumId}/${name}`
      const pathname_preview = `${albumId}/${name}.preview.webp`
      const pathname_thumb = `${albumId}/${name}.thumb.webp`
      const filePath = path.join(GALLERY_FOLDER, pathname)

      await new Promise<void>((resolve, reject) => {
        file.arrayBuffer().then((buffer) => {
          fs.writeFile(filePath, Buffer.from(buffer), (err) => {
            if (err) {
              reject(err)
            }
            else {
              resolve()
            }
          })
        })
      })

      const [metadata]: [ExifReader.Tags, unknown, unknown] = await Promise.all([
        new Promise<ExifReader.Tags>((resolve) => {
          ExifReader.load(filePath).then((metadata) => {
            resolve(metadata)
          })
        }),
        new Promise<void>((resolve, reject) => {
          const outputPath = path.join(GALLERY_FOLDER, pathname_preview)
          sharp(filePath)
            .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 90 })
            .keepExif()
            .toFile(outputPath, (err, info) => {
              if (err) return reject(err)
              console.log(info)
              resolve()
            })
        }),
        new Promise<void>((resolve, reject) => {
          const outputPath = path.join(GALLERY_FOLDER, pathname_thumb)
          sharp(filePath)
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 90 })
            .keepExif()
            .toFile(outputPath, (err, info) => {
              if (err) return reject(err)
              console.log(info)
              resolve()
            })
        })
      ])

      const { width, height } = await sharp(filePath).metadata()

      objects.push({
        name,
        id,
        albumId,
        pathname,
        pathname_preview,
        pathname_thumb,
        contentType: file.type,
        size: file.size,
        aspectRatio: ((width || 0) / (height || 0)) || 1,
        width: width || 0,
        height: height || 0,
        createdAt: Date.now(),
        updatedAt: file.lastModified,
        metadata
      })
    }

    catalog.push(...objects)
    flushCatalog()
  }
  catch (e: unknown) {
    throw createError({
      statusCode: 500,
      message: `Storage error: ${(e as Error).message}`
    })
  }
  return objects
}

const updateImageInfo = async (id: string, image: GalImageInfo) => {
  return new Promise<void>((resolve, reject) => {
    getCatalog().then((catalog) => {
      const index = catalog.findIndex((i: GalImage) => i.id === id)
      if (index !== -1) {
        if (image.presentationInfo) {
          catalog[index].presentationInfo = Object.assign(catalog[index].presentationInfo || {}, image.presentationInfo)
        }

        if (image.presentationSettings) {
          catalog[index].presentationSettings = Object.assign(catalog[index].presentationSettings || {}, image.presentationSettings)
        }

        flushCatalog().then(resolve).catch(reject)
      }
      else {
        reject('Image not found')
      }
    })
  })
}

export { addImageToCatalog, getCatalog, getAlbumsList, flushCatalog, removeFromCatalog, uploadImages, updateImageInfo }
