import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import Student from '#models/student'
import { createStudentGamificationValidator } from '#validators/student_gamification'

export default class CreateStudentGamificationController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createStudentGamificationValidator)

    // Check if student exists
    const student = await Student.find(payload.studentId)
    if (!student) {
      return response.notFound({ message: 'Student not found' })
    }

    // Check if gamification profile already exists for this student
    const existingGamification = await StudentGamification.findBy('studentId', payload.studentId)
    if (existingGamification) {
      return response.conflict({ message: 'Gamification profile already exists for this student' })
    }

    const gamification = await StudentGamification.create({
      studentId: payload.studentId,
      totalPoints: 0,
      currentLevel: 1,
    })

    await gamification.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })

    return response.created(gamification)
  }
}
