import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Student from '#models/student'
import { checkExistingValidator } from '#validators/online_enrollment'
import AppException from '#exceptions/app_exception'

export default class CheckExistingStudentController {
  async handle({ request, response }: HttpContext) {
    const { document, email, levelId } = await request.validateUsing(checkExistingValidator)

    if (!document && !email) {
      throw AppException.badRequest('Informe o documento ou e-mail')
    }

    let existingUser: User | null = null

    if (document) {
      existingUser = await User.query().where('document', document).first()
    }

    if (!existingUser && email) {
      existingUser = await User.query().where('email', email).first()
    }

    if (!existingUser) {
      return response.ok({ exists: false })
    }

    // Check if user is already a student
    const student = await Student.find(existingUser.id)

    if (!student) {
      return response.ok({
        exists: true,
        isStudent: false,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
      })
    }

    // Check if already enrolled in this level
    const existingEnrollment = await student
      .related('levels')
      .query()
      .where('levelId', levelId)
      .first()

    return response.ok({
      exists: true,
      isStudent: true,
      alreadyEnrolled: !!existingEnrollment,
      student: {
        id: student.id,
        enrollmentStatus: student.enrollmentStatus,
      },
    })
  }
}
