import { z } from 'zod'
import { updateImageInfo } from '../../util/catalog'

const imageInfoSchema = z.object({
  title: z.ostring().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  copyright: z.string().optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isHidden: z.boolean().optional()
})

const imageSettingsSchema = z.object({
  light: z.number().optional(),
  blur: z.number().optional(),
  sepia: z.number().optional(),
  saturate: z.number().optional(),
  contrast: z.number().optional(),
  shadow: z.boolean().optional(),
  bluredBackground: z.boolean().optional(),
  crop: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  frameField: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  frameColor: z.string().optional()
})

const imageSchema = z.object({
  presentationInfo: imageInfoSchema.optional(),
  presentationSettings: imageSettingsSchema.optional()
})

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const id = (event.context.params?.slug || '')
  const result = await readValidatedBody(event, body => imageSchema.safeParse(body))
  if (result.success) {
    await updateImageInfo(id, result.data)
  }
  else {
    throw createError({
      statusCode: 400,
      message: 'Invalid image data'
    })
  }
})
