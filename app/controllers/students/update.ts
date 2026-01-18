import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Student from '#models/student'
import { updateStudentValidator } from '#validators/student'

export default class UpdateStudentController {
  async handle({ params, request, response }: HttpContext) {
    const student = await Student.query()
      .where('id', params.id)
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
