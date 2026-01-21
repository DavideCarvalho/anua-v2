import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'

export default class DeleteAcademicPeriodController {
  async handle({ params, response, auth }: HttpContext) {
    const academicPeriod = await AcademicPeriod.find(params.id)

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    // Check if user has access to this school
    const schoolId = auth.user?.schoolId
    if (schoolId && academicPeriod.schoolId !== schoolId) {
      return response.forbidden({ message: 'Sem permissão para excluir este período letivo' })
    }

    // Check if period has already started
    const now = new Date()
    const startDate = new Date(academicPeriod.startDate.toJSDate())
    if (now >= startDate) {
      return response.badRequest({
        message: 'Não é possível excluir um período letivo que já iniciou',
      })
    }

    await academicPeriod.delete()

    return response.ok({ message: 'Período letivo excluído com sucesso' })
  }
}
