import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import Teacher from '#models/teacher'
import StudentPayment from '#models/student_payment'
import { DateTime } from 'luxon'

export default class GetEscolaStatsController {
  async handle({ response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
    }

    // Para stats, usar a primeira escola selecionada (ou agregar todas)
    const schoolId = selectedSchoolIds[0]

    const now = DateTime.now()
    const startOfMonth = now.startOf('month')
    const endOfMonth = now.endOf('month')

    const totalStudents = await Student.query()
      .whereHas('user', (q) => {
        q.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    const activeStudents = await Student.query()
      .whereHas('user', (q) => {
        q.where('schoolId', schoolId).where('active', true).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    const totalTeachers = await Teacher.query()
      .whereHas('user', (userQuery) => {
        userQuery.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    const paidPayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId)
        })
      })
      .where('status', 'PAID')
      .where('paidAt', '>=', startOfMonth.toISO()!)
      .where('paidAt', '<=', endOfMonth.toISO()!)
      .sum('amount as total')
      .first()

    const pendingPayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId)
        })
      })
      .where('status', 'PENDING')
      .count('* as total')
      .first()

    return {
      totalStudents: Number(totalStudents?.$extras.total) || 0,
      activeStudents: Number(activeStudents?.$extras.total) || 0,
      totalTeachers: Number(totalTeachers?.$extras.total) || 0,
      monthlyRevenue: Number(paidPayments?.$extras.total) || 0,
      pendingPayments: Number(pendingPayments?.$extras.total) || 0,
      attendanceRate: 0,
    }
  }
}
