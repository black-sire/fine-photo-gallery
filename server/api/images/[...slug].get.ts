// import z from 'zod'
import { getCatalog } from '~~/server/util/catalog'
import type { GalImage } from '~~/types'

export default eventHandler(async (event) => {
  /* const { pathname } = await getValidatedRouterParams(event, z.object({
    pathname: z.string().min(1)
  }).parse)
  */

  const pathname = event.context.params?.slug || ''
  console.log('pathname:' + pathname, event.context.params)
  const catalog = await getCatalog()
  return catalog.filter((image: GalImage) => image.pathname === pathname)
})
