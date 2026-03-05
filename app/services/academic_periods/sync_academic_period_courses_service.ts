import { v7 as uuidv7 } from 'uuid'
import type AcademicPeriod from '#models/academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import TeacherHasClass from '#models/teacher_has_class'
import Level from '#models/level'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import { dispatchEnrollmentPaymentUpdatesForLevelContracts } from '#services/payments/dispatch_enrollment_payment_updates_service'

export type UpdateAcademicPeriodCoursesPayload = {
  courses: Array<{
    id?: string
    courseId: string
    levels: Array<{
      id?: string
      levelId?: string
      name: string
      order: number
      contractId?: string
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
}

type TriggerUser = { id: string; name: string } | null

export async function syncAcademicPeriodCourses(
  academicPeriod: AcademicPeriod,
  payload: UpdateAcademicPeriodCoursesPayload,
  triggerUser: TriggerUser
) {
  const changedLevelContracts = new Map<string, string | null>()

  await db.transaction(async (trx) => {
    const existingCaps = await CourseHasAcademicPeriod.query()
      .where('academicPeriodId', academicPeriod.id)
      .useTransaction(trx)

    const existingCapIds = existingCaps.map((cap) => cap.id)
    const incomingCapIds = payload.courses.filter((c) => c.id).map((c) => c.id as string)

    const capsToDelete = existingCapIds.filter((id) => !incomingCapIds.includes(id))
    if (capsToDelete.length > 0) {
      await LevelAssignedToCourseHasAcademicPeriod.query()
        .whereIn('courseHasAcademicPeriodId', capsToDelete)
        .useTransaction(trx)
        .delete()

      await CourseHasAcademicPeriod.query().whereIn('id', capsToDelete).useTransaction(trx).delete()
    }

    for (const courseData of payload.courses) {
      let cap: CourseHasAcademicPeriod

      if (courseData.id) {
        const existingCap = await CourseHasAcademicPeriod.query()
          .where('id', courseData.id)
          .useTransaction(trx)
          .first()

        if (!existingCap) {
          continue
        }

        cap = existingCap
      } else {
        cap = new CourseHasAcademicPeriod()
        cap.useTransaction(trx)
        cap.courseId = courseData.courseId
        cap.academicPeriodId = academicPeriod.id
        await cap.save()
      }

      const existingLas = await LevelAssignedToCourseHasAcademicPeriod.query()
        .where('courseHasAcademicPeriodId', cap.id)
        .useTransaction(trx)

      const existingLaIds = existingLas.map((la) => la.id)
      const incomingLaIds = courseData.levels.filter((l) => l.id).map((l) => l.id as string)

      const lasToDelete = existingLaIds.filter((id) => !incomingLaIds.includes(id))
      if (lasToDelete.length > 0) {
        const deletedLevelIds = existingLas
          .filter((la) => lasToDelete.includes(la.id))
          .map((la) => la.levelId)

        const levelsStillUsedInPeriod = await LevelAssignedToCourseHasAcademicPeriod.query()
          .join(
            'CourseHasAcademicPeriod',
            'LevelAssignedToCourseHasAcademicPeriod.courseHasAcademicPeriodId',
            'CourseHasAcademicPeriod.id'
          )
          .where('CourseHasAcademicPeriod.academicPeriodId', academicPeriod.id)
          .whereIn('LevelAssignedToCourseHasAcademicPeriod.levelId', deletedLevelIds)
          .where('LevelAssignedToCourseHasAcademicPeriod.isActive', true)
          .whereNot('LevelAssignedToCourseHasAcademicPeriod.courseHasAcademicPeriodId', cap.id)
          .select('LevelAssignedToCourseHasAcademicPeriod.levelId')
          .useTransaction(trx)

        const stillUsedLevelIds = new Set(levelsStillUsedInPeriod.map((row) => row.levelId))
        const levelIdsToArchive = deletedLevelIds.filter(
          (levelId) => !stillUsedLevelIds.has(levelId)
        )

        if (levelIdsToArchive.length > 0) {
          const classIdsToArchive = await ClassHasAcademicPeriod.query()
            .where('academicPeriodId', academicPeriod.id)
            .whereHas('class', (classQuery) => {
              classQuery.whereIn('levelId', levelIdsToArchive).where('isArchived', false)
            })
            .select('classId')
            .useTransaction(trx)

          const classIds = classIdsToArchive.map((row) => row.classId)

          if (classIds.length > 0) {
            await TeacherHasClass.query()
              .whereIn('classId', classIds)
              .useTransaction(trx)
              .update({ isActive: false })

            await Class_.query().whereIn('id', classIds).useTransaction(trx).update({
              isArchived: true,
            })

            await ClassHasAcademicPeriod.query()
              .where('academicPeriodId', academicPeriod.id)
              .whereIn('classId', classIds)
              .useTransaction(trx)
              .delete()
          }
        }

        await LevelAssignedToCourseHasAcademicPeriod.query()
          .whereIn('id', lasToDelete)
          .useTransaction(trx)
          .delete()
      }

      for (const levelData of courseData.levels) {
        let levelId = levelData.levelId

        if (!levelId) {
          const existingLevel = await Level.query()
            .where('schoolId', academicPeriod.schoolId)
            .where('name', levelData.name)
            .useTransaction(trx)
            .first()

          if (existingLevel) {
            const nextContractId = levelData.contractId ?? null
            changedLevelContracts.set(existingLevel.id, nextContractId)

            existingLevel.order = levelData.order
            existingLevel.contractId = nextContractId
            await existingLevel.save()
            levelId = existingLevel.id
          } else {
            const newLevel = new Level()
            newLevel.useTransaction(trx)
            newLevel.id = uuidv7()
            newLevel.name = levelData.name
            newLevel.order = levelData.order
            newLevel.contractId = levelData.contractId ?? null
            newLevel.schoolId = academicPeriod.schoolId
            newLevel.isActive = true
            await newLevel.save()
            changedLevelContracts.set(newLevel.id, newLevel.contractId)
            levelId = newLevel.id
          }
        } else {
          const existingLevel = await Level.query().where('id', levelId).useTransaction(trx).first()

          if (existingLevel) {
            const nextContractId = levelData.contractId ?? null
            changedLevelContracts.set(existingLevel.id, nextContractId)

            existingLevel.order = levelData.order
            existingLevel.contractId = nextContractId
            await existingLevel.save()
          }
        }

        if (levelData.id) {
          await LevelAssignedToCourseHasAcademicPeriod.query()
            .where('id', levelData.id)
            .useTransaction(trx)
            .update({
              levelId,
              isActive: levelData.isActive ?? true,
            })
        } else {
          const la = new LevelAssignedToCourseHasAcademicPeriod()
          la.useTransaction(trx)
          la.levelId = levelId
          la.courseHasAcademicPeriodId = cap.id
          la.isActive = levelData.isActive ?? true
          await la.save()
        }

        if (levelData.classes && levelId) {
          const existingClassesInPeriod = await ClassHasAcademicPeriod.query()
            .where('academicPeriodId', academicPeriod.id)
            .preload('class', (q) => q.where('levelId', levelId))
            .useTransaction(trx)

          const existingClassIds = existingClassesInPeriod
            .filter((chap) => chap.class?.levelId === levelId)
            .map((chap) => chap.classId)

          const incomingClassIds = levelData.classes.filter((c) => c.id).map((c) => c.id as string)
          const classesToRemove = existingClassIds.filter((id) => !incomingClassIds.includes(id))

          if (classesToRemove.length > 0) {
            await TeacherHasClass.query()
              .whereIn('classId', classesToRemove)
              .useTransaction(trx)
              .update({ isActive: false })

            await Class_.query().whereIn('id', classesToRemove).useTransaction(trx).update({
              isArchived: true,
            })

            await ClassHasAcademicPeriod.query()
              .where('academicPeriodId', academicPeriod.id)
              .whereIn('classId', classesToRemove)
              .useTransaction(trx)
              .delete()
          }

          for (const classData of levelData.classes) {
            let classEntity: Class_

            if (classData.id) {
              const existingClass = await Class_.query()
                .where('id', classData.id)
                .useTransaction(trx)
                .first()

              if (!existingClass) {
                continue
              }

              existingClass.name = classData.name
              existingClass.isArchived = false
              await existingClass.save()
              classEntity = existingClass
            } else {
              classEntity = new Class_()
              classEntity.useTransaction(trx)
              classEntity.id = uuidv7()
              classEntity.name = classData.name
              classEntity.levelId = levelId
              classEntity.schoolId = academicPeriod.schoolId
              classEntity.isArchived = false
              await classEntity.save()

              const classHasAcademicPeriod = new ClassHasAcademicPeriod()
              classHasAcademicPeriod.useTransaction(trx)
              classHasAcademicPeriod.classId = classEntity.id
              classHasAcademicPeriod.academicPeriodId = academicPeriod.id
              await classHasAcademicPeriod.save()
            }

            if (classData.teachers) {
              const existingTeachers = await TeacherHasClass.query()
                .where('classId', classEntity.id)
                .useTransaction(trx)

              const existingTeacherIds = existingTeachers.map((t) => t.id)
              const incomingTeacherIds = classData.teachers
                .filter((t) => t.id)
                .map((t) => t.id as string)

              const teachersToRemove = existingTeacherIds.filter(
                (id) => !incomingTeacherIds.includes(id)
              )
              if (teachersToRemove.length > 0) {
                await TeacherHasClass.query()
                  .whereIn('id', teachersToRemove)
                  .useTransaction(trx)
                  .update({ isActive: false })
              }

              for (const teacherData of classData.teachers) {
                if (teacherData.id) {
                  await TeacherHasClass.query()
                    .where('id', teacherData.id)
                    .useTransaction(trx)
                    .update({
                      teacherId: teacherData.teacherId,
                      subjectId: teacherData.subjectId,
                      subjectQuantity: teacherData.subjectQuantity,
                      isActive: true,
                    })
                } else {
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

  try {
    await dispatchEnrollmentPaymentUpdatesForLevelContracts({
      academicPeriodId: academicPeriod.id,
      levelContracts: changedLevelContracts,
      triggeredBy: triggerUser,
    })
  } catch (error) {
    logger.error({ error }, '[SYNC_ACADEMIC_PERIOD_COURSES] Failed to dispatch payment updates')
  }
}
