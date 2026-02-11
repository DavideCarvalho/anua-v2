import type { HttpContext } from '@adonisjs/core/http'
import { v7 as uuidv7 } from 'uuid'
import AcademicPeriod from '#models/academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import TeacherHasClass from '#models/teacher_has_class'
import db from '@adonisjs/lucid/services/db'
import { updateCoursesValidator } from '#validators/academic_period'

export default class UpdateAcademicPeriodCoursesController {
  async handle({ params, request, response }: HttpContext) {
    const academicPeriod = await AcademicPeriod.find(params.id)

    if (!academicPeriod) {
      return response.notFound({ message: 'Periodo letivo nao encontrado' })
    }

    const payload: {
      courses: Array<{
        id?: string
        courseId: string
        levels: Array<{
          id?: string
          levelId: string
          isActive?: boolean
          classes?: Array<{
            id?: string
            name: string
            teachers?: Array<{
              id?: string
              teacherId: string
              subjectId: string
              subjectQuantity: number
            }>
          }>
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

          // Handle classes for this level
          if (levelData.classes) {
            // Get existing classes for this level in this academic period
            const existingClassesInPeriod = await ClassHasAcademicPeriod.query()
              .where('academicPeriodId', academicPeriod.id)
              .preload('class', (q) => q.where('levelId', levelData.levelId))
              .useTransaction(trx)

            const existingClassIds = existingClassesInPeriod
              .filter((chap) => chap.class?.levelId === levelData.levelId)
              .map((chap) => chap.classId)

            const incomingClassIds = levelData.classes
              .filter((c) => c.id)
              .map((c) => c.id as string)

            // Delete removed classes from this academic period
            const classesToRemove = existingClassIds.filter((id) => !incomingClassIds.includes(id))
            if (classesToRemove.length > 0) {
              await ClassHasAcademicPeriod.query()
                .where('academicPeriodId', academicPeriod.id)
                .whereIn('classId', classesToRemove)
                .useTransaction(trx)
                .delete()
            }

            // Create or update classes
            for (const classData of levelData.classes) {
              let classEntity: Class_

              if (classData.id) {
                // Update existing class
                const existingClass = await Class_.query()
                  .where('id', classData.id)
                  .useTransaction(trx)
                  .first()

                if (!existingClass) {
                  continue
                }

                existingClass.name = classData.name
                await existingClass.save()
                classEntity = existingClass
              } else {
                // Create new class
                classEntity = new Class_()
                classEntity.useTransaction(trx)
                classEntity.id = uuidv7()
                classEntity.name = classData.name
                classEntity.levelId = levelData.levelId
                classEntity.schoolId = academicPeriod.schoolId
                classEntity.isArchived = false
                await classEntity.save()

                // Link class to academic period
                const classHasAcademicPeriod = new ClassHasAcademicPeriod()
                classHasAcademicPeriod.useTransaction(trx)
                classHasAcademicPeriod.classId = classEntity.id
                classHasAcademicPeriod.academicPeriodId = academicPeriod.id
                await classHasAcademicPeriod.save()
              }

              // Handle teachers for this class
              if (classData.teachers) {
                // Get existing teachers for this class
                const existingTeachers = await TeacherHasClass.query()
                  .where('classId', classEntity.id)
                  .useTransaction(trx)

                const existingTeacherIds = existingTeachers.map((t) => t.id)
                const incomingTeacherIds = classData.teachers
                  .filter((t) => t.id)
                  .map((t) => t.id as string)

                // Delete removed teachers
                const teachersToRemove = existingTeacherIds.filter(
                  (id) => !incomingTeacherIds.includes(id)
                )
                if (teachersToRemove.length > 0) {
                  await TeacherHasClass.query()
                    .whereIn('id', teachersToRemove)
                    .useTransaction(trx)
                    .delete()
                }

                // Create or update teachers
                for (const teacherData of classData.teachers) {
                  if (teacherData.id) {
                    // Update existing
                    await TeacherHasClass.query()
                      .where('id', teacherData.id)
                      .useTransaction(trx)
                      .update({
                        teacherId: teacherData.teacherId,
                        subjectId: teacherData.subjectId,
                        subjectQuantity: teacherData.subjectQuantity,
                      })
                  } else {
                    // Create new
                    const teacherHasClass = new TeacherHasClass()
                    teacherHasClass.useTransaction(trx)
                    teacherHasClass.id = uuidv7()
                    teacherHasClass.teacherId = teacherData.teacherId
                    teacherHasClass.classId = classEntity.id
                    teacherHasClass.subjectId = teacherData.subjectId
                    teacherHasClass.subjectQuantity = teacherData.subjectQuantity
                    teacherHasClass.isActive = true
                    await teacherHasClass.save()
                  }
                }
              }
            }
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

    // Get all classes for this academic period
    const classesInPeriod = await ClassHasAcademicPeriod.query()
      .where('academicPeriodId', academicPeriod.id)
      .preload('class', (classQuery) => {
        classQuery.preload('teacherClasses', (teacherClassQuery) => {
          teacherClassQuery.preload('teacher', (teacherQuery) => {
            teacherQuery.preload('user')
          })
          teacherClassQuery.preload('subject')
        })
      })

    // Create a map of levelId -> classes
    const classesMap = new Map<string, typeof classesInPeriod>()
    for (const chap of classesInPeriod) {
      const levelId = chap.class.levelId
      if (levelId) {
        if (!classesMap.has(levelId)) {
          classesMap.set(levelId, [])
        }
        classesMap.get(levelId)!.push(chap)
      }
    }

    const courses = updatedPeriod.courseAcademicPeriods.map((cap) => ({
      id: cap.id,
      courseId: cap.courseId,
      name: cap.course.name,
      levels: cap.levelAssignments
        .map((la) => {
          const levelClasses = classesMap.get(la.levelId) || []
          return {
            id: la.id,
            levelId: la.levelId,
            name: la.level.name,
            order: la.level.order,
            contractId: la.level.contractId,
            isActive: la.isActive,
            classes: levelClasses.map((chap) => ({
              id: chap.class.id,
              name: chap.class.name,
              teachers: chap.class.teacherClasses.map((tc) => ({
                id: tc.id,
                teacherId: tc.teacherId,
                teacherName: tc.teacher?.user?.name || '',
                subjectId: tc.subjectId,
                subjectName: tc.subject?.name || '',
                subjectQuantity: tc.subjectQuantity,
              })),
            })),
          }
        })
        .sort((a, b) => a.order - b.order),
    }))

    return response.ok(courses)
  }
}
