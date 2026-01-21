import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(6),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().email().trim(),
    password: vine.string().minLength(6).confirmed(),
  })
)

export const sendCodeValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)

export const verifyCodeValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    code: vine.string().fixedLength(6),
  })
)
