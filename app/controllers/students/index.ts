import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'

export default class IndexStudentsController {
  async handle({ request, response, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const classId = request.input('classId')
    const academicPeriodId = request.input('academicPeriodId')
    const courseId = request.input('courseId')
    const enrollmentStatus = request.input('enrollmentStatus')

    const user = effectiveUser ?? auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    await user.load('role')
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role?.name || '')

    // Admins podem passar schoolId param, outros usam selectedSchoolIds do middleware
    const schoolIds = isAdmin
      ? request.input('schoolId')
        ? [request.input('schoolId')]
        : selectedSchoolIds
      : selectedSchoolIds

    if ((!schoolIds || schoolIds.length === 0) && !isAdmin) {
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
    }

    const query = Student.query()
      .whereHas('levels', (levelQuery) => {
        levelQuery.whereNull('deletedAt')
      })
      .preload('user')
      .preload('class')
      .orderBy('id', 'desc')

    if (search) {
      query.whereHas('user', (userQuery) => {
        userQuery
          .whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('documentNumber', `%${search}%`)
      })
    }

    // Filtrar por escolas selecionadas
    if (schoolIds && schoolIds.length > 0) {
      query.whereHas('user', (userQuery) => {
        userQuery.whereIn('schoolId', schoolIds)
      })
    }

    if (classId) {
      query.where('classId', classId)
    }

    // Filtrar por período letivo e/ou curso via StudentHasLevel
    if (academicPeriodId || courseId) {
      query.whereHas('levels', (slQuery) => {
        slQuery
          .whereNull('deletedAt')
          .whereHas('levelAssignedToCourseAcademicPeriod', (lacapQuery) => {
            lacapQuery.whereHas('courseHasAcademicPeriod', (chapQuery) => {
              if (academicPeriodId) {
                chapQuery.where('academicPeriodId', academicPeriodId)
              }
              if (courseId) {
                chapQuery.where('courseId', courseId)
              }
            })
          })
      })
    }

    if (enrollmentStatus) {
      query.where('enrollmentStatus', enrollmentStatus)
    }

    const students = await query.paginate(page, limit)

    return response.ok(students)
  }
}
