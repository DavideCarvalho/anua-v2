import vine from '@vinejs/vine'

const fieldSchema = vine.object({
  name: vine.string().trim().maxLength(100),
  type: vine.enum(['signature', 'date']),
  position: vine.object({
    x: vine.number(),
    y: vine.number(),
  }),
  width: vine.number().positive(),
  height: vine.number().positive(),
  rotate: vine.number().optional(),
  format: vine.string().trim().maxLength(50).optional(),
  fontSize: vine.number().optional(),
  alignment: vine.string().trim().optional(),
  fontColor: vine.string().trim().optional(),
  backgroundColor: vine.string().trim().optional(),
  locale: vine.string().trim().optional(),
  opacity: vine.number().optional(),
  required: vine.boolean().optional(),
  readOnly: vine.boolean().optional(),
  content: vine.string().optional(),
})

export const uploadSignatureTemplateValidator = vine.compile(
  vine.object({
    schemas: vine.array(vine.array(fieldSchema)),
    fileName: vine.string().trim().optional(),
    fileBase64: vine.string().trim().optional(),
  })
)
