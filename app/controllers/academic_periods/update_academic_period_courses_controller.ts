import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import db from '@adonisjs/lucid/services/db'
import { updateCoursesValidator } from '#validators/academic_period'

export default class UpdateAcademicPeriodCoursesController {
  async handle({ params, request, response }: HttpContext) {
    const academicPeriod = await AcademicPeriod.find(params.id)

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    const payload: {
      courses: Array<{
        id?: string
        courseId: string
        levels: Array<{
          id?: string
          levelId: string
          isActive?: boolean
        }>
      }>
    } = await request.validateUsing(updateCoursesValidator)

    await db.transaction(async (trx) => {
      // Get existing course-academic period relationships
      const existingCaps = await CourseHasAcademicPeriod.query()
        .where('academicPeriodId', academicPeriod.id)
        .useTransaction(trx)

      const existingCapIds = existingCaps.map((cap) => cap.id)
      const incomingCapIds = payload.courses.filter((c) => c.id).map((c) => c.id as string)

      // Delete removed course-academic period relationships
      const capsToDelete = existingCapIds.filter((id) => !incomingCapIds.includes(id))
      if (capsToDelete.length > 0) {
        // First delete level assignments
        await LevelAssignedToCourseHasAcademicPeriod.query()
          .whereIn('courseHasAcademicPeriodId', capsToDelete)
          .useTransaction(trx)
          .delete()

        // Then delete course-academic period relationships
        await CourseHasAcademicPeriod.query()
          .whereIn('id', capsToDelete)
          .useTransaction(trx)
          .delete()
      }

      // Create or update course-academic period relationships
      for (const courseData of payload.courses) {
        let cap: CourseHasAcademicPeriod

        if (courseData.id) {
          // Update existing
          const existingCap = await CourseHasAcademicPeriod.query()
            .where('id', courseData.id)
            .useTransaction(trx)
            .first()

          if (!existingCap) {
            continue
          }

          cap = existingCap
        } else {
          // Create new
          cap = new CourseHasAcademicPeriod()
          cap.useTransaction(trx)
          cap.courseId = courseData.courseId
          cap.academicPeriodId = academicPeriod.id
          await cap.save()
        }

        // Get existing level assignments for this course-academic period
        const existingLas = await LevelAssignedToCourseHasAcademicPeriod.query()
          .where('courseHasAcademicPeriodId', cap.id)
          .useTransaction(trx)

        const existingLaIds = existingLas.map((la) => la.id)
        const incomingLaIds = courseData.levels.filter((l) => l.id).map((l) => l.id as string)

        // Delete removed level assignments
        const lasToDelete = existingLaIds.filter((id) => !incomingLaIds.includes(id))
        if (lasToDelete.length > 0) {
          await LevelAssignedToCourseHasAcademicPeriod.query()
            .whereIn('id', lasToDelete)
            .useTransaction(trx)
            .delete()
        }

        // Create or update level assignments
        for (const levelData of courseData.levels) {
          if (levelData.id) {
            // Update existing
            await LevelAssignedToCourseHasAcademicPeriod.query()
              .where('id', levelData.id)
              .useTransaction(trx)
              .update({
                isActive: levelData.isActive ?? true,
              })
          } else {
            // Create new
            const la = new LevelAssignedToCourseHasAcademicPeriod()
            la.useTransaction(trx)
            la.levelId = levelData.levelId
            la.courseHasAcademicPeriodId = cap.id
            la.isActive = levelData.isActive ?? true
            await la.save()
          }
        }
      }
    })

    // Return updated data
    const updatedPeriod = await AcademicPeriod.query()
      .where('id', academicPeriod.id)
      .preload('courseAcademicPeriods', (courseQuery) => {
        courseQuery.preload('course')
        courseQuery.preload('levelAssignments', (levelQuery) => {
          levelQuery.preload('level')
        })
      })
      .firstOrFail()

    const courses = updatedPeriod.courseAcademicPeriods.map((cap) => ({
      id: cap.id,
      courseId: cap.courseId,
      name: cap.course.name,
      levels: cap.levelAssignments
        .map((la) => ({
          id: la.id,
          levelId: la.levelId,
          name: la.level.name,
          order: la.level.order,
          contractId: la.level.contractId,
          isActive: la.isActive,
        }))
        .sort((a, b) => a.order - b.order),
    }))

    return response.ok(courses)
  }
}
