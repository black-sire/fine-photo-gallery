import { getCatalog } from '../../util/catalog'

export default eventHandler(async () => {
  return getCatalog()
})
