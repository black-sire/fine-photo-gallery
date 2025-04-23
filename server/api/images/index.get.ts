import { getCatalog } from '../../util/catalog'
import type { GalImage } from '~~/types'

export default eventHandler(async (event) => {
  return getCatalog().then((catalog) => {
    const { albumId } = event.context.params || {}
    return albumId ? catalog.filter((image: GalImage) => image.albumId === albumId) : catalog
  })
})
