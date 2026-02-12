import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Student from '#models/student'
import { createStudentValidator } from '#validators/student'
import string from '@adonisjs/core/helpers/string'
import AppException from '#exceptions/app_exception'

export default class StoreStudentController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createStudentValidator)

    // Check if email already exists
    if (data.email) {
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    const trx = await db.transaction()

    try {
      // Create user first
      const user = await User.create(
        {
          name: data.name,
          slug: string.slug(data.name, { lower: true }),
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate ? DateTime.fromJSDate(data.birthDate) : null,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          schoolId: data.schoolId,
          active: true,
        },
        { client: trx }
      )

      // Create student with same ID
      // Note: Model uses descountPercentage (typo in DB)
      const student = await Student.create(
        {
          id: user.id,
          descountPercentage: data.discountPercentage ?? 0,
          monthlyPaymentAmount: data.monthlyPaymentAmount ?? 0,
          isSelfResponsible: data.isSelfResponsible ?? false,
          paymentDate: data.paymentDate,
          classId: data.classId,
          contractId: data.contractId,
          canteenLimit: data.canteenLimit,
          balance: 0,
          enrollmentStatus: data.enrollmentStatus ?? 'PENDING_DOCUMENT_REVIEW',
        },
        { client: trx }
      )

      await trx.commit()

      // Reload with relationships
      const studentWithRelations = await Student.query()
        .where('id', student.id)
        .preload('user')
        .firstOrFail()

      return response.created(studentWithRelations)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
