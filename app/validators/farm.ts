import vine from '@vinejs/vine'

export const plotActionValidator = vine.compile(
  vine.object({
    plotId: vine.number().min(0).max(15),
  })
)
