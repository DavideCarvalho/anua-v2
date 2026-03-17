import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Student from '#models/student'
import StudentTransformer from '#transformers/student_transformer'
import StudentHasLevel from '#models/student_has_level'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import { updateStudentValidator } from '#validators/student'
import AppException from '#exceptions/app_exception'

export default class UpdateStudentController {
  async handle({ params, request, response, serialize }: HttpContext) {
    const student = await Student.query()
      .where('id', params.id)
      .whereHas('levels', (levelQuery) => {
        levelQuery
          .whereNull('deletedAt')
          .whereHas('levelAssignedToCourseAcademicPeriod', (lacap) => {
            lacap.whereHas('courseHasAcademicPeriod', (chap) => {
              chap.whereHas('academicPeriod', (academicPeriodQuery) => {
                academicPeriodQuery.where('isActive', true).whereNull('deletedAt')
              })
            })
          })
      })
      .preload('user')
      .first()

    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    const data = await request.validateUsing(updateStudentValidator)

    // Normalize email to lowercase
    const normalizedEmail = data.email?.trim().toLowerCase()

    // Check email conflict
    if (normalizedEmail && normalizedEmail !== student.user.email?.toLowerCase()) {
      const existingUser = await User.findBy('email', normalizedEmail)
      if (existingUser) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    const trx = await db.transaction()

    try {
      // Update user fields
      student.user.merge({
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        birthDate: data.birthDate ? DateTime.fromJSDate(data.birthDate) : undefined,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
      })
      await student.user.useTransaction(trx).save()

      // Update student fields only if any student field is provided
      const hasStudentUpdates =
        data.discountPercentage !== undefined ||
        data.monthlyPaymentAmount !== undefined ||
        data.isSelfResponsible !== undefined ||
        data.paymentDate !== undefined ||
        data.classId !== undefined ||
        data.contractId !== undefined ||
        data.canteenLimit !== undefined ||
        data.balance !== undefined ||
        data.enrollmentStatus !== undefined

      if (hasStudentUpdates) {
        student.merge({
          descountPercentage: data.discountPercentage,
          monthlyPaymentAmount: data.monthlyPaymentAmount,
          isSelfResponsible: data.isSelfResponsible,
          paymentDate: data.paymentDate,
          classId: data.classId,
          contractId: data.contractId,
          canteenLimit: data.canteenLimit,
          balance: data.balance,
          enrollmentStatus: data.enrollmentStatus,
        })
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

      return response.ok(await serialize(StudentTransformer.transform(studentWithRelations)))
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
