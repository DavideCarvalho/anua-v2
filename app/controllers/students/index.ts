import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import StudentDto from '#models/dto/student.dto'
import AppException from '#exceptions/app_exception'

export default class IndexStudentsController {
  async handle({ request, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const classId = request.input('classId')
    const academicPeriodId = request.input('academicPeriodId')
    const courseId = request.input('courseId')
    const enrollmentStatus = request.input('enrollmentStatus')

    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    await user.load('role')
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role?.name || '')

    // Admins podem passar schoolId param, outros usam selectedSchoolIds do middleware
    const schoolIds = isAdmin
      ? request.input('schoolId')
        ? [request.input('schoolId')]
        : selectedSchoolIds
      : selectedSchoolIds

    const query = Student.query()
      .where((q) => {
        q.whereDoesntHave('levels', () => {}).orWhereHas('levels', (levelQuery) => {
          levelQuery.whereNull('deletedAt')
        })
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
    } else if (!isAdmin) {
      query.whereRaw('1 = 0')
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
    } else {
      // Por padrão, filtrar por períodos letivos em curso ou encerrados mas ainda ativos
      const today = DateTime.now().toSQLDate()!
      query.where((q) => {
        q.whereDoesntHave('levels', () => {}).orWhereHas('levels', (slQuery) => {
          slQuery.whereNull('deletedAt').whereHas('academicPeriod', (apQuery) => {
            apQuery.where((ap) => {
              // Em curso: hoje entre startDate e endDate
              ap.where((inProgress) => {
                inProgress.where('startDate', '<=', today).where('endDate', '>=', today)
              })
                // Ou encerrado mas ainda ativo
                .orWhere((endedButActive) => {
                  endedButActive.where('endDate', '<', today).where('isActive', true)
                })
            })
          })
        })
      })
    }

    if (enrollmentStatus) {
      query.where('enrollmentStatus', enrollmentStatus)
    }

    const students = await query.paginate(page, limit)

    return StudentDto.fromPaginator(students)
  }
}
