import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import ClassListItemDto from './dtos/class_list_item.dto.js'
import db from '@adonisjs/lucid/services/db'

export default class ListClassesController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds } = ctx
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const levelId = request.input('levelId')
    const schoolId = request.input('schoolId')
    const status = request.input('status')
    const academicPeriodId = request.input('academicPeriodId')

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Class_.query()
      .preload('level')
      .withCount('students')
      .orderBy('name', 'asc')

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
      // Find levels that belong to this academic period through the chain:
      // AcademicPeriod -> CourseHasAcademicPeriod -> LevelAssignedToCourseHasAcademicPeriod -> Level
      const levelIds = db
        .from('LevelAssignedToCourseHasAcademicPeriod as la')
        .innerJoin('CourseHasAcademicPeriod as ca', 'la.courseHasAcademicPeriodId', 'ca.id')
        .where('ca.academicPeriodId', academicPeriodId)
        .select('la.levelId')

      query.whereIn('levelId', levelIds)
    }

    const classes = await query.paginate(page, limit)

    return ClassListItemDto.fromPaginator(classes)
  }
}
