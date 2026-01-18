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
      points: 0,
      level: 1,
      experience: 0,
      streakDays: 0,
      lastActivityDate: null,
      totalAssignmentsCompleted: 0,
      totalExamsTaken: 0,
      averageGrade: 0,
      attendancePercentage: 0,
    })

    await gamification.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })

    return response.created(gamification)
  }
}
