import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'

export default class DestroyStudentController {
  async handle({ params, request, response }: HttpContext) {
    const studentId = params.id
    const academicPeriodId = request.input('academicPeriodId')

    const student = await Student.find(studentId)
    if (!student) {
      return response.notFound({ message: 'Aluno não encontrado' })
    }

    // Soft delete StudentHasLevel records
    const query = StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')

    // If academicPeriodId is provided, only delete for that period
    if (academicPeriodId) {
      query.where('academicPeriodId', academicPeriodId)
    }

    const studentLevels = await query

    if (studentLevels.length === 0) {
      return response.notFound({ message: 'Nenhuma matrícula ativa encontrada' })
    }

    // Soft delete all matching StudentHasLevel records
    const now = DateTime.now()
    for (const studentLevel of studentLevels) {
      studentLevel.deletedAt = now
      await studentLevel.save()
    }

    return response.noContent()
  }
}
