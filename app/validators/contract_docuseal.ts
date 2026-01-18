import vine from '@vinejs/vine'

export const uploadContractDocusealTemplateValidator = vine.compile(
  vine.object({
    fileName: vine.string().trim(),
    fileBase64: vine.string().trim(),
  })
)
