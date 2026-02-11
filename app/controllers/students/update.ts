import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import { updateStudentValidator } from '#validators/student'

export default class UpdateStudentController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const student = await Student.query()
      .where('id', params.id)
      .whereHas('class', (classQuery) => {
        classQuery.whereIn('schoolId', selectedSchoolIds ?? [])
      })
      .preload('user')
      .first()

    if (!student) {
      return response.notFound({ message: 'Aluno não encontrado' })
    }

    const data = await request.validateUsing(updateStudentValidator)

    // Check email conflict
    if (data.email && data.email !== student.user.email) {
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.conflict({ message: 'Já existe um usuário com este email' })
      }
    }

    const trx = await db.transaction()

    try {
      // Update user fields
      const userFields = ['name', 'email', 'phone', 'birthDate', 'documentType', 'documentNumber']
      const userUpdates: Record<string, unknown> = {}

      for (const field of userFields) {
        if (data[field as keyof typeof data] !== undefined) {
          userUpdates[field] = data[field as keyof typeof data]
        }
      }

      if (Object.keys(userUpdates).length > 0) {
        student.user.merge(userUpdates)
        await student.user.useTransaction(trx).save()
      }

      // Update student fields
      const studentFields = [
        'discountPercentage',
        'monthlyPaymentAmount',
        'isSelfResponsible',
        'paymentDate',
        'classId',
        'contractId',
        'canteenLimit',
        'balance',
        'enrollmentStatus',
      ]
      const studentUpdates: Record<string, unknown> = {}

      for (const field of studentFields) {
        if (data[field as keyof typeof data] !== undefined) {
          studentUpdates[field] = data[field as keyof typeof data]
        }
      }

      if (Object.keys(studentUpdates).length > 0) {
        student.merge(studentUpdates)
        await student.useTransaction(trx).save()
      }

      // Handle class change with StudentHasLevel
      if (data.classId && data.academicPeriodId && data.levelId) {
        // Find the LevelAssignedToCourseHasAcademicPeriod
        const levelAssignmentQuery = LevelAssignedToCourseHasAcademicPeriod.query({ client: trx })
          .where('levelId', data.levelId)
          .whereHas('courseHasAcademicPeriod', (query) => {
            query.where('academicPeriodId', data.academicPeriodId!)
            if (data.courseId) {
              query.where('courseId', data.courseId)
            }
          })

        const levelAssignment = await levelAssignmentQuery.first()

        if (levelAssignment) {
          // Check if student already has a StudentHasLevel for this academic period
          const existingStudentLevel = await StudentHasLevel.query({ client: trx })
            .where('studentId', student.id)
            .where('academicPeriodId', data.academicPeriodId)
            .first()

          if (existingStudentLevel) {
            // Update existing record
            existingStudentLevel.merge({
              levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
              levelId: data.levelId,
              classId: data.classId,
            })
            await existingStudentLevel.useTransaction(trx).save()
          } else {
            // Create new StudentHasLevel
            await StudentHasLevel.create(
              {
                studentId: student.id,
                levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
                academicPeriodId: data.academicPeriodId,
                levelId: data.levelId,
                classId: data.classId,
              },
              { client: trx }
            )
          }
        }
      }

      await trx.commit()

      // Reload with relationships
      const studentWithRelations = await Student.query()
        .where('id', student.id)
        .preload('user')
        .firstOrFail()

      return response.ok(studentWithRelations)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
