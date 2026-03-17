import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import Student from '#models/student'
import { createStudentGamificationValidator } from '#validators/student_gamification'
import AppException from '#exceptions/app_exception'
import StudentGamificationTransformer from '#transformers/student_gamification_transformer'

export default class CreateStudentGamificationController {
  async handle({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createStudentGamificationValidator)

    // Check if student exists
    const student = await Student.find(payload.studentId)
    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    // Check if gamification profile already exists for this student
    const existingGamification = await StudentGamification.findBy('studentId', payload.studentId)
    if (existingGamification) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const gamification = await StudentGamification.create({
      studentId: payload.studentId,
      totalPoints: 0,
      currentLevel: 1,
    })

    await gamification.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })

    return response.created(await serialize(StudentGamificationTransformer.transform(gamification)))
  }
}
