import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'

export default class DeleteAcademicPeriodController {
  async handle({ params, response, auth }: HttpContext) {
    const academicPeriod = await AcademicPeriod.find(params.id)

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    // Check if already deleted
    if (academicPeriod.deletedAt) {
      return response.badRequest({ message: 'Período letivo já foi excluído' })
    }

    // Check if user has access to this school
    const schoolId = auth.user?.schoolId
    if (schoolId && academicPeriod.schoolId !== schoolId) {
      return response.forbidden({ message: 'Sem permissão para excluir este período letivo' })
    }

    academicPeriod.deletedAt = DateTime.now()
    await academicPeriod.save()

    return response.ok({ message: 'Período letivo excluído com sucesso' })
  }
}
