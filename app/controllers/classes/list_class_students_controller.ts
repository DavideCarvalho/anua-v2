import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import StudentHasLevel from '#models/student_has_level'
import StudentDto from '#models/dto/student.dto'

export default class ListClassStudentsController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.id
    const courseId = request.input('courseId')
    const academicPeriodId = request.input('academicPeriodId')

    if (!courseId || !academicPeriodId) {
      return response.badRequest({ message: 'courseId e academicPeriodId são obrigatórios' })
    }

    const classEntity = await Class_.find(classId)
    if (!classEntity) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Get students via StudentHasLevel with course+period validation
    // Only return active enrollments (not soft-deleted)
    const studentLevels = await StudentHasLevel.query()
      .where('classId', classId)
      .whereNull('deletedAt')
      .whereHas('levelAssignedToCourseAcademicPeriod', (laQuery) => {
        laQuery.where('isActive', true).whereHas('courseHasAcademicPeriod', (caQuery) => {
          caQuery.where('courseId', courseId).where('academicPeriodId', academicPeriodId)
        })
      })
      .preload('student', (sq) => sq.preload('user'))
      .orderBy('createdAt', 'asc')
      .paginate(page, limit)

    // Extract students from studentLevels
    const students = studentLevels.all().map((sl) => sl.student)

    return response.ok({
      data: StudentDto.fromArray(students),
      meta: studentLevels.getMeta(),
    })
  }
}
