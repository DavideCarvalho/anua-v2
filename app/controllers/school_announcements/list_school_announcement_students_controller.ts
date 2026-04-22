import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import AppException from '#exceptions/app_exception'

export default class ListSchoolAnnouncementStudentsController {
  async handle({ auth, effectiveUser, selectedSchoolIds, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      throw AppException.forbidden('Nenhuma escola selecionada')
    }

    const schoolId = selectedSchoolIds[0]

    const students = await Student.query()
      .whereHas('class', (classQuery) => {
        classQuery.where('schoolId', schoolId)
      })
      .preload('user')
      .preload('class')

    const data = students
      .map((student) => ({
        id: student.id,
        name: student.user.name,
        className: student.class?.name ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

    return response.ok({ data })
  }
}
