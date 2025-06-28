import { getAlbumsList } from '../../util/catalog'

export default eventHandler(async () => {
  return getAlbumsList()
})
