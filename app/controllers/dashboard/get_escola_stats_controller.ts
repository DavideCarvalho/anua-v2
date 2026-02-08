import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import Teacher from '#models/teacher'
import StudentPayment from '#models/student_payment'
import AcademicPeriod from '#models/academic_period'

export default class GetEscolaStatsController {
  async handle({ response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
    }

    // Para stats, usar a primeira escola selecionada (ou agregar todas)
    const schoolId = selectedSchoolIds[0]

    const totalStudents = await Student.query()
      .whereHas('user', (q) => {
        q.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    // Alunos ativos = alunos com pelo menos uma matrícula ativa em período ativo
    const activeStudents = await Student.query()
      .whereHas('user', (q) => {
        q.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .whereHas('levels', (levelQ) => {
        levelQ.whereNull('deletedAt').whereHas('academicPeriod', (periodQ) => {
          periodQ.where('isActive', true).whereNull('deletedAt')
        })
      })
      .count('* as total')
      .first()

    // Períodos letivos ativos
    const activeAcademicPeriods = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('isActive', true)
      .whereNull('deletedAt')
      .count('* as total')
      .first()

    const totalTeachers = await Teacher.query()
      .whereHas('user', (userQuery) => {
        userQuery.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    // Previsão de receita mensal: soma de todos os StudentPayments dos alunos ativos
    // no mês/ano atual, apenas se existir um período letivo ativo (isActive=true, start<=hoje<=end)
    // excluindo pagamentos cancelados ou renegociados
    const now = DateTime.now()

    // Verifica se existe período letivo ativo para a data atual
    const hasActivePeriod = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('isActive', true)
      .whereNull('deletedAt')
      .where('startDate', '<=', now.toSQLDate())
      .where('endDate', '>=', now.toSQLDate())
      .first()

    let monthlyRevenue = 0
    if (hasActivePeriod) {
      // Soma os pagamentos do mês/ano atual (usa índice em studentId+month+year)
      const revenueResult = await StudentPayment.query()
        .where('month', now.month)
        .where('year', now.year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .whereHas('student', (studentQuery) => {
          studentQuery.whereHas('user', (userQuery) => {
            userQuery.where('schoolId', schoolId).whereNull('deletedAt')
          })
        })
        .sum('amount as total')
        .first()

      monthlyRevenue = Number(revenueResult?.$extras.total || 0)
    }

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
      activeAcademicPeriods: Number(activeAcademicPeriods?.$extras.total) || 0,
      totalTeachers: Number(totalTeachers?.$extras.total) || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      pendingPayments: Number(pendingPayments?.$extras.total) || 0,
      attendanceRate: 0,
    }
  }
}
