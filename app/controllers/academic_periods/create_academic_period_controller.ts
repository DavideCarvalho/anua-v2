import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import Level from '#models/level'
import Class_ from '#models/class'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import TeacherHasClass from '#models/teacher_has_class'
import { createAcademicPeriodValidator } from '#validators/academic_period'
import AcademicPeriodDto from '#models/dto/academic_period.dto'

export default class CreateAcademicPeriodController {
  async handle({ request, response, auth }: HttpContext) {
    let payload
    try {
      payload = await request.validateUsing(createAcademicPeriodValidator)
    } catch (error) {
      return response.badRequest({ message: 'Erro de validação', errors: error.messages })
    }

    const schoolId = payload.schoolId ?? auth.user?.schoolId
    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não possui escola' })
    }

    const result = await db.transaction(async (trx) => {
      // 1. Create Academic Period
      const academicPeriod = new AcademicPeriod()
      academicPeriod.useTransaction(trx)
      academicPeriod.schoolId = schoolId
      academicPeriod.name = payload.name
      academicPeriod.startDate = DateTime.fromJSDate(payload.startDate)
      academicPeriod.endDate = DateTime.fromJSDate(payload.endDate)
      academicPeriod.enrollmentStartDate = payload.enrollmentStartDate
        ? DateTime.fromJSDate(payload.enrollmentStartDate)
        : null
      academicPeriod.enrollmentEndDate = payload.enrollmentEndDate
        ? DateTime.fromJSDate(payload.enrollmentEndDate)
        : null
      academicPeriod.segment = payload.segment
      academicPeriod.previousAcademicPeriodId = payload.previousAcademicPeriodId ?? null
      academicPeriod.minimumGradeOverride = payload.minimumGradeOverride ?? null
      academicPeriod.minimumAttendanceOverride = payload.minimumAttendanceOverride ?? null
      academicPeriod.isActive = true
      academicPeriod.isClosed = false
      await academicPeriod.save()

      // 2. Create Courses, Levels, Classes if provided
      if (payload.courses && payload.courses.length > 0) {
        for (const courseData of payload.courses) {
          let course: Course

          if (courseData.courseId) {
            // Use existing course by ID
            const existingCourse = await Course.query()
              .where('id', courseData.courseId)
              .useTransaction(trx)
              .first()
            if (!existingCourse) {
              throw new Error(`Curso não encontrado: ${courseData.courseId}`)
            }
            course = existingCourse
          } else {
            // Try to find existing course by name and school
            const existingCourse = await Course.query()
              .where('schoolId', schoolId)
              .where('name', courseData.name)
              .useTransaction(trx)
              .first()

            if (existingCourse) {
              course = existingCourse
            } else {
              // Create new course
              course = new Course()
              course.useTransaction(trx)
              course.name = courseData.name
              course.schoolId = schoolId
              course.version = 1
              await course.save()
            }
          }

          // Link course to academic period
          const courseHasAcademicPeriod = new CourseHasAcademicPeriod()
          courseHasAcademicPeriod.useTransaction(trx)
          courseHasAcademicPeriod.courseId = course.id
          courseHasAcademicPeriod.academicPeriodId = academicPeriod.id
          await courseHasAcademicPeriod.save()

          // Create/link levels
          for (const levelData of courseData.levels) {
            let level: Level

            if (levelData.levelId) {
              // Use existing level by ID
              const existingLevel = await Level.query()
                .where('id', levelData.levelId)
                .useTransaction(trx)
                .first()
              if (!existingLevel) {
                throw new Error(`Série não encontrada: ${levelData.levelId}`)
              }
              level = existingLevel
            } else {
              // Try to find existing level by name and school
              const existingLevel = await Level.query()
                .where('schoolId', schoolId)
                .where('name', levelData.name)
                .useTransaction(trx)
                .first()

              if (existingLevel) {
                level = existingLevel
              } else {
                // Create new level
                level = new Level()
                level.useTransaction(trx)
                level.name = levelData.name
                level.order = levelData.order
                level.schoolId = schoolId
                level.contractId = levelData.contractId ?? null
                level.isActive = true
                await level.save()
              }
            }

            // Link level to course-academic-period
            const levelAssignment = new LevelAssignedToCourseHasAcademicPeriod()
            levelAssignment.useTransaction(trx)
            levelAssignment.levelId = level.id
            levelAssignment.courseHasAcademicPeriodId = courseHasAcademicPeriod.id
            levelAssignment.isActive = true
            await levelAssignment.save()

            // Create classes
            if (levelData.classes && levelData.classes.length > 0) {
              for (const classData of levelData.classes) {
                // Create class
                const classEntity = new Class_()
                classEntity.useTransaction(trx)
                classEntity.name = classData.name
                classEntity.slug = string.slug(classData.name, { lower: true })
                classEntity.levelId = level.id
                classEntity.schoolId = schoolId
                classEntity.isArchived = false
                await classEntity.save()

                // Link class to academic period
                const classHasAcademicPeriod = new ClassHasAcademicPeriod()
                classHasAcademicPeriod.useTransaction(trx)
                classHasAcademicPeriod.classId = classEntity.id
                classHasAcademicPeriod.academicPeriodId = academicPeriod.id
                await classHasAcademicPeriod.save()

                // Create teacher assignments
                if (classData.teachers && classData.teachers.length > 0) {
                  for (const teacherData of classData.teachers) {
                    const teacherHasClass = new TeacherHasClass()
                    teacherHasClass.useTransaction(trx)
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

      return new AcademicPeriodDto(academicPeriod)
    })

    return response.created(result)
  }
}
