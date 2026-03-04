import type { HttpContext } from '@adonisjs/core/http'
import StudentAvatar from '#models/student_avatar'
import Student from '#models/student'
import AppException from '#exceptions/app_exception'
import vine from '@vinejs/vine'

const updateAvatarValidator = vine.compile(
  vine.object({
    skinTone: vine.string().optional(),
    hairStyle: vine.string().optional(),
    hairColor: vine.string().optional(),
    outfit: vine.string().optional(),
    accessories: vine.array(vine.string()).optional(),
  })
)

export default class UpdateStudentAvatarController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    const user = effectiveUser
    if (!user) {
      throw AppException.invalidCredentials()
    }

    const student = await Student.find(user.id)
    if (!student) {
      throw AppException.forbidden('Usuário não é um aluno')
    }

    const payload = await request.validateUsing(updateAvatarValidator)

    let avatar = await StudentAvatar.query().where('studentId', student.id).first()

    if (!avatar) {
      avatar = await StudentAvatar.create({
        studentId: student.id,
        skinTone: payload.skinTone ?? 'medium',
        hairStyle: payload.hairStyle ?? 'default',
        hairColor: payload.hairColor ?? 'brown',
        outfit: payload.outfit ?? 'default',
        accessories: payload.accessories ?? [],
      })
    } else {
      if (payload.skinTone !== undefined) avatar.skinTone = payload.skinTone
      if (payload.hairStyle !== undefined) avatar.hairStyle = payload.hairStyle
      if (payload.hairColor !== undefined) avatar.hairColor = payload.hairColor
      if (payload.outfit !== undefined) avatar.outfit = payload.outfit
      if (payload.accessories !== undefined) avatar.accessories = payload.accessories
      await avatar.save()
    }

    return response.ok({
      id: avatar.id,
      studentId: avatar.studentId,
      skinTone: avatar.skinTone,
      hairStyle: avatar.hairStyle,
      hairColor: avatar.hairColor,
      outfit: avatar.outfit,
      accessories: avatar.accessories,
    })
  }
}
