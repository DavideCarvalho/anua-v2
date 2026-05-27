import type { HttpContext } from '@adonisjs/core/http'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ExportStudentsCsvJob from '#jobs/exports/export_students_csv_job'
import AppException from '#exceptions/app_exception'

export default class ExportStudentsCsvController {
  async handle({ request, response, auth, selectedSchoolIds }: HttpContext) {
    if (!auth.user) {
      throw AppException.invalidCredentials()
    }

    const { academicPeriodId, courseId, classId, search } = request.qs()

    await ExportStudentsCsvJob.dispatch({
      userId: auth.user.id,
      schoolIds: selectedSchoolIds ?? [],
      filters: {
        academicPeriodId: academicPeriodId ?? undefined,
        courseId: courseId ?? undefined,
        classId: classId ?? undefined,
        search: search ?? undefined,
      },
    })

    return response.accepted({
      message: 'Exportação iniciada. Você receberá uma notificação quando o arquivo estiver pronto.',
    })
  }

  async download({ params, response }: HttpContext) {
    const { token } = params
    const dir = join(process.cwd(), 'tmp', 'exports')

    if (!existsSync(dir)) {
      throw AppException.notFound('Arquivo não encontrado')
    }

    const files = readdirSync(dir)
    const match = files.find((f) => f.includes(token) && f.endsWith('.csv'))

    if (!match) {
      throw AppException.notFound('Arquivo não encontrado ou expirado')
    }

    const filepath = join(dir, match)
    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${match}"`)
    return response.download(filepath)
  }
}
