import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'

export default class DestroyStudentController {
  async handle({ params, response, auth }: HttpContext) {
    const student = await Student.query().where('id', params.id).preload('user').first()

    if (!student) {
      return response.notFound({ message: 'Aluno não encontrado' })
    }

    // Soft delete the user (which cascades to student conceptually)
    student.user.deletedAt = DateTime.now()
    student.user.deletedBy = auth.use('web').user?.id ?? null
    student.user.active = false
    await student.user.save()

    return response.noContent()
  }
}
