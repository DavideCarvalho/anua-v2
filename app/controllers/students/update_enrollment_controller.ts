import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import { updateEnrollmentValidator } from '#validators/student_enrollment'

export default class UpdateEnrollmentController {
  async handle({ params, request, response }: HttpContext) {
    const { id: studentId, enrollmentId } = params
    const payload = await request.validateUsing(updateEnrollmentValidator)

    const enrollment = await StudentHasLevel.query()
      .where('id', enrollmentId)
      .where('studentId', studentId)
      .firstOrFail()

    enrollment.merge(payload)
    await enrollment.save()

    // Reload with relations
    await enrollment.load('academicPeriod')
    await enrollment.load('contract')
    await enrollment.load('scholarship')
    await enrollment.load('level')
    await enrollment.load('class')

    return response.ok(enrollment)
  }
}
