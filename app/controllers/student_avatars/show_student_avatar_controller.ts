import type { HttpContext } from '@adonisjs/core/http'
import StudentAvatar from '#models/student_avatar'
import Student from '#models/student'
import AppException from '#exceptions/app_exception'

export default class ShowStudentAvatarController {
  async handle({ response, effectiveUser }: HttpContext) {
    const user = effectiveUser
    if (!user) {
      throw AppException.invalidCredentials()
    }

    const student = await Student.find(user.id)
    if (!student) {
      throw AppException.forbidden('Usuário não é um aluno')
    }

    let avatar = await StudentAvatar.query().where('studentId', student.id).first()

    if (!avatar) {
      avatar = await StudentAvatar.create({
        studentId: student.id,
        skinTone: 'medium',
        hairStyle: 'default',
        hairColor: 'brown',
        outfit: 'default',
        accessories: [],
      })
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
