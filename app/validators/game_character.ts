import vine from '@vinejs/vine'

export const createGameCharacterValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    class: vine.enum(['mage', 'warrior', 'dwarf']),
  })
)
