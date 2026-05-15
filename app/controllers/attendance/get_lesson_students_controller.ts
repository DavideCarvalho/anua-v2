import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'
import Attendance from '#models/attendance'
import AppException from '#exceptions/app_exception'
import { getLessonStudentsValidator } from '#validators/attendance'

/**
 * Lista os alunos de uma chamada específica — usado quando a vista
 * "Por aula" expande uma linha. Inclui status, justificativa e dados da
 * última edição. classId vem da query string só pra alimentar o
 * canAccessAttendance middleware (que autoriza por turma).
 */
export default class GetLessonStudentsController {
  async handle({ params, request, response }: HttpContext) {
    await request.validateUsing(getLessonStudentsValidator)

    const attendance = await Attendance.find(params.id)
    if (!attendance) {
      throw AppException.notFound('Chamada não encontrada')
    }

    const studentAttendances = await StudentHasAttendance.query()
      .where('attendanceId', params.id)
      .preload('student', (sq) => sq.preload('user'))
      .preload('lastEditedBy')
      .orderBy('createdAt', 'asc')

    const data = studentAttendances
      .map((sha) => ({
        id: sha.id,
        studentId: sha.studentId,
        studentName: sha.student?.user?.name ?? 'Aluno',
        status: sha.status,
        justification: sha.justification,
        lastEdit:
          sha.lastEditedAt && sha.lastEditedBy
            ? {
                editedBy: { id: sha.lastEditedBy.id, name: sha.lastEditedBy.name },
                editedAt: sha.lastEditedAt.toISO(),
              }
            : null,
      }))
      .sort((a, b) => a.studentName.localeCompare(b.studentName))

    return response.ok({ data })
  }
}
