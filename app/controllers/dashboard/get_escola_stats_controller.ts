import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import Teacher from '#models/teacher'
import StudentPayment from '#models/student_payment'
import StudentHasLevel from '#models/student_has_level'

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

    const totalTeachers = await Teacher.query()
      .whereHas('user', (userQuery) => {
        userQuery.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    // Previsão de receita mensal: soma dos contratos das matrículas ativas em períodos ativos
    // aplicando o desconto da bolsa quando existir
    const studentLevels = await StudentHasLevel.query()
      .whereNull('deletedAt')
      .whereNotNull('contractId')
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId).whereNull('deletedAt')
        })
      })
      .whereHas('academicPeriod', (periodQ) => {
        periodQ.where('isActive', true).whereNull('deletedAt')
      })
      .preload('contract')
      .preload('scholarship')

    let monthlyRevenue = 0
    for (const studentLevel of studentLevels) {
      const contractAmount = studentLevel.contract?.ammount || 0
      const discountPercentage = studentLevel.scholarship?.discountPercentage || 0
      const effectiveAmount = contractAmount * (1 - discountPercentage / 100)
      monthlyRevenue += effectiveAmount
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
      totalTeachers: Number(totalTeachers?.$extras.total) || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      pendingPayments: Number(pendingPayments?.$extras.total) || 0,
      attendanceRate: 0,
    }
  }
}
