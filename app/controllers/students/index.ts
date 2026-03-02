import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import StudentTransformer from '#transformers/student_transformer'
import AppException from '#exceptions/app_exception'
import { listStudentsValidator } from '#validators/student'

export default class IndexStudentsController {
  async handle({ request, auth, effectiveUser, selectedSchoolIds, serialize }: HttpContext) {
    const filters = await request.validateUsing(listStudentsValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const search = filters.search ?? ''
    const classId = filters.classId
    const academicPeriodId = filters.academicPeriodId
    const courseId = filters.courseId
    const enrollmentStatus = filters.enrollmentStatus

    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    await user.load('role')
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role?.name || '')

    // Admins podem passar schoolId param, outros usam selectedSchoolIds do middleware
    const schoolIds = isAdmin
      ? filters.schoolId
        ? [filters.schoolId]
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
    const data = students.all()
    const metadata = students.getMeta()

    return serialize(StudentTransformer.paginate(data, metadata))
  }
}
