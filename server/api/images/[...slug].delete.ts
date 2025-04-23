import { removeFromCatalog } from '../../util/catalog'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const id = (event.context.params?.slug || '')
  await removeFromCatalog(id)
})
