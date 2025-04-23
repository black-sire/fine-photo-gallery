import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import mime from 'mime'
// import { z } from 'zod'

function getContentType(pathOrExtension: string) {
  return (pathOrExtension && mime.getType(pathOrExtension)) || 'application/octet-stream'
}

const GALLERY_FOLDER = process.env.GALLERY_FOLDER || './data'

export default eventHandler(async (event) => {
  /*
  const { pathname } = await getValidatedRouterParams(event, z.object({
    pathname: z.string().min(1)
  }).parse)
  */

  const pathname = event.context.params?.slug || ''
  // console.log('1pathname:' + pathname, event.context.params)

  const filePath = path.join(GALLERY_FOLDER, pathname)
  const object = fs.createReadStream(filePath)

  // setHeader(event, 'Content-Type', getContentType(pathname))
  // setHeader(event, 'Content-Length', object.readableLength)
  return object
})
