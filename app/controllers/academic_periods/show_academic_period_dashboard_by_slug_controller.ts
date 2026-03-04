import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'
import AcademicPeriodDashboardTransformer from '#transformers/academic_period_dashboard_transformer'

export default class ShowAcademicPeriodDashboardBySlugController {
  async handle({ params, serialize }: HttpContext) {
    const academicPeriod = await AcademicPeriod.query()
      .where('slug', params.slug)
      .whereNull('deletedAt')
      .preload('courseAcademicPeriods', (courseQuery) => {
        courseQuery.preload('course')
        courseQuery.preload('levelAssignments', (levelQuery) => {
          levelQuery.preload('level')
        })
      })
      .first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    const courseAcademicPeriods = await Promise.all(
      academicPeriod.courseAcademicPeriods.map(async (courseAcademicPeriod) => {
        const levelAssignments = await Promise.all(
          courseAcademicPeriod.levelAssignments.map(async (assignment) => {
            const studentsCountResult = await assignment
              .related('studentLevels')
              .query()
              .whereNull('deletedAt')
              .where('academicPeriodId', academicPeriod.id)
              .count('* as total')

            const classesCountResult = await Class_.query()
              .where('levelId', assignment.levelId)
              .where('isArchived', false)
              .whereHas('academicPeriods', (periodQuery) => {
                periodQuery.where('AcademicPeriod.id', academicPeriod.id)
              })
              .count('* as total')

            const studentsCount = Number(studentsCountResult[0]?.$extras?.total ?? 0)
            const classesCount = Number(classesCountResult[0]?.$extras?.total ?? 0)

            return {
              id: assignment.id,
              levelId: assignment.levelId,
              courseHasAcademicPeriodId: assignment.courseHasAcademicPeriodId,
              isActive: assignment.isActive,
              studentsCount,
              classesCount,
              level: assignment.level
                ? {
                    id: assignment.level.id,
                    name: assignment.level.name,
                    slug: assignment.level.slug,
                    order: assignment.level.order,
                    contractId: assignment.level.contractId,
                    isActive: assignment.level.isActive,
                  }
                : null,
            }
          })
        )

        const levelsCount = levelAssignments.length
        const activeLevelsCount = levelAssignments.filter(
          (assignment) => assignment.isActive
        ).length
        const inactiveLevelsCount = levelsCount - activeLevelsCount
        const studentsCount = levelAssignments.reduce(
          (total, assignment) => total + assignment.studentsCount,
          0
        )
        const classesCount = levelAssignments.reduce(
          (total, assignment) => total + assignment.classesCount,
          0
        )

        return {
          id: courseAcademicPeriod.id,
          courseId: courseAcademicPeriod.courseId,
          academicPeriodId: courseAcademicPeriod.academicPeriodId,
          course: courseAcademicPeriod.course
            ? {
                id: courseAcademicPeriod.course.id,
                name: courseAcademicPeriod.course.name,
                slug: courseAcademicPeriod.course.slug,
                enrollmentMinimumAge: courseAcademicPeriod.course.enrollmentMinimumAge,
                enrollmentMaximumAge: courseAcademicPeriod.course.enrollmentMaximumAge,
                maxStudentsPerClass: courseAcademicPeriod.course.maxStudentsPerClass,
              }
            : null,
          metrics: {
            levelsCount,
            activeLevelsCount,
            inactiveLevelsCount,
            studentsCount,
            classesCount,
          },
          levelAssignments,
        }
      })
    )

    const metrics = {
      coursesCount: courseAcademicPeriods.length,
      levelsCount: courseAcademicPeriods.reduce(
        (total, item) => total + item.metrics.levelsCount,
        0
      ),
      studentsCount: courseAcademicPeriods.reduce(
        (total, item) => total + item.metrics.studentsCount,
        0
      ),
      classesCount: courseAcademicPeriods.reduce(
        (total, item) => total + item.metrics.classesCount,
        0
      ),
    }

    return serialize(
      AcademicPeriodDashboardTransformer.transform({
        id: academicPeriod.id,
        name: academicPeriod.name,
        slug: academicPeriod.slug,
        startDate: academicPeriod.startDate,
        endDate: academicPeriod.endDate,
        enrollmentStartDate: academicPeriod.enrollmentStartDate,
        enrollmentEndDate: academicPeriod.enrollmentEndDate,
        isActive: academicPeriod.isActive,
        segment: academicPeriod.segment,
        isClosed: academicPeriod.isClosed,
        metrics,
        courseAcademicPeriods,
      })
    )
  }
}
