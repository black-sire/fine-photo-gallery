import { uploadImages } from '~~/server/util/catalog'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const multiple = false
  const form = await readFormData(event)
  const files: File[] = form.getAll('files') as File[]
  const albumId = form.get('albumId')?.toString() || 'common'
  if (!files) {
    throw createError({ statusCode: 400, message: 'Missing files' })
  }
  if (!multiple && files.length > 1) {
    throw createError({ statusCode: 400, message: 'Multiple files are not allowed' })
  }
  return await uploadImages(files, albumId)
})
