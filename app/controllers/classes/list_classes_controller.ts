import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import ListClassesResponseDto from './dtos/list_classes_response.dto.js'
import { listClassesValidator } from '#validators/class'

export default class ListClassesController {
  async handle(ctx: HttpContext) {
    const { auth, request, selectedSchoolIds } = ctx
    const user = ctx.effectiveUser ?? auth.user!
    const filters = await request.validateUsing(listClassesValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const search = filters.search ?? ''
    const levelId = filters.levelId
    const schoolId = filters.schoolId
    const status = filters.status
    const academicPeriodId = filters.academicPeriodId

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Class_.query()
      .preload('level')
      .withCount('studentLevels', (q) => {
        q.whereNull('deletedAt').whereHas('academicPeriod', (periodQ) => {
          periodQ.where('isActive', true).whereNull('deletedAt')
        })
      })
      .orderBy('name', 'asc')

    if (user.roleId && !user.$preloaded.role) {
      await user.load('role')
    }

    if (user.role?.name === 'SCHOOL_TEACHER') {
      query.whereHas('teacherClasses', (teacherClassQuery) => {
        teacherClassQuery.where('teacherId', user.id).where('isActive', true)
      })
    }

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (levelId) {
      query.where('levelId', levelId)
    }

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    if (status) {
      query.where('status', status)
    }

    if (academicPeriodId) {
      query.whereHas('academicPeriods', (periodQ) => {
        periodQ.where('AcademicPeriod.id', academicPeriodId).whereNull('AcademicPeriod.deletedAt')
      })
    } else {
      query.whereHas('academicPeriods', (periodQ) => {
        periodQ.where('AcademicPeriod.isActive', true).whereNull('AcademicPeriod.deletedAt')
      })
    }

    const classes = await query.paginate(page, limit)

    return ListClassesResponseDto.fromPaginator(classes)
  }
}
