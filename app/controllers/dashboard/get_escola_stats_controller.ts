import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import Teacher from '#models/teacher'
import StudentPayment from '#models/student_payment'
import AcademicPeriod from '#models/academic_period'
import EmployeeBenefit from '#models/employee_benefit'
import db from '@adonisjs/lucid/services/db'

export default class GetEscolaStatsController {
  async handle({ selectedSchoolIds, request }: HttpContext) {
    const scopedSchoolIds = selectedSchoolIds ?? []
    if (scopedSchoolIds.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        activeAcademicPeriods: 0,
        totalTeachers: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        overduePayments: 0,
        upcomingPayments: 0,
        attendanceRate: 0,
        revenueTrends: [],
        overdueAging: {
          ranges: [
            { label: '0-30', count: 0, amountCents: 0 },
            { label: '31-60', count: 0, amountCents: 0 },
            { label: '61+', count: 0, amountCents: 0 },
          ],
          totalCount: 0,
          totalAmountCents: 0,
        },
        payrollCosts: {
          teachersCostCents: 0,
          staffCostCents: 0,
          benefitsCostCents: 0,
          totalCostCents: 0,
        },
        breakEvenMonthlyCents: 0,
        breakEvenGapCents: 0,
        breakEvenStatus: 'balanced',
      }
    }

    // Para stats, usar a primeira escola selecionada (ou agregar todas)
    const schoolId = scopedSchoolIds[0]
    const query = request.qs() as {
      academicPeriodId?: string
      courseId?: string
      levelId?: string
      classId?: string
    }

    let scopedStudentIds: string[] | null = null
    if (query.academicPeriodId || query.courseId || query.levelId || query.classId) {
      const studentScopeQuery = db
        .from('Student as st')
        .join('User as u', 'u.id', 'st.id')
        .leftJoin('Class as c', 'c.id', 'st.classId')
        .leftJoin('StudentHasLevel as shl', 'shl.studentId', 'st.id')
        .where('u.schoolId', schoolId)
        .whereNull('u.deletedAt')
        .select('st.id')
        .distinct('st.id')

      if (query.classId) {
        studentScopeQuery.where('st.classId', query.classId)
      }
      if (query.courseId) {
        studentScopeQuery.where('c.courseId', query.courseId)
      }
      if (query.levelId) {
        studentScopeQuery.where('shl.levelId', query.levelId)
      }
      if (query.academicPeriodId) {
        studentScopeQuery.where('shl.academicPeriodId', query.academicPeriodId)
      }

      const rows = await studentScopeQuery
      scopedStudentIds = rows.map((row) => String(row.id))
    }

    const totalStudents = await Student.query()
      .whereHas('user', (q) => {
        q.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .if(scopedStudentIds !== null, (queryBuilder) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          queryBuilder.whereRaw('1 = 0')
          return
        }
        queryBuilder.whereIn('id', scopedStudentIds)
      })
      .count('* as total')
      .first()

    // Alunos ativos = alunos com pelo menos uma matrícula ativa em período ativo
    const activeStudents = await Student.query()
      .whereHas('user', (q) => {
        q.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .if(scopedStudentIds !== null, (queryBuilder) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          queryBuilder.whereRaw('1 = 0')
          return
        }
        queryBuilder.whereIn('id', scopedStudentIds)
      })
      .whereHas('levels', (levelQ) => {
        levelQ
          .whereNull('deletedAt')
          .if(query.levelId, (q) => q.where('levelId', query.levelId!))
          .if(query.academicPeriodId, (q) => q.where('academicPeriodId', query.academicPeriodId!))
          .whereHas('academicPeriod', (periodQ) => {
            periodQ.where('isActive', true).whereNull('deletedAt')
          })
      })
      .count('* as total')
      .first()

    // Períodos letivos ativos
    const activeAcademicPeriods = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('isActive', true)
      .if(query.academicPeriodId, (q) => q.where('id', query.academicPeriodId!))
      .whereNull('deletedAt')
      .count('* as total')
      .first()

    const totalTeachers = await Teacher.query()
      .whereHas('user', (userQuery) => {
        userQuery.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .count('* as total')
      .first()

    // Previsão de receita mensal: soma dos StudentPayments do mês/ano atual da escola
    // (inclui mensalidade, matrícula, loja, cantina, aula extra, cursos etc.)
    // excluindo pagamentos cancelados, renegociados e acordos
    const now = DateTime.now()

    const revenueResult = await StudentPayment.query()
      .where('month', now.month)
      .where('year', now.year)
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      .whereNotIn('type', ['AGREEMENT'])
      .whereHas('student', (studentQuery) => {
        studentQuery.whereHas('user', (userQuery) => {
          userQuery.where('schoolId', schoolId).whereNull('deletedAt')
        })
        if (scopedStudentIds !== null) {
          if (!scopedStudentIds || scopedStudentIds.length === 0) {
            studentQuery.whereRaw('1 = 0')
          } else {
            studentQuery.whereIn('id', scopedStudentIds)
          }
        }
      })
      .sum('amount as total')
      .first()

    const monthlyRevenue = Number(revenueResult?.$extras.total || 0)

    const pendingPayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId)
        })
        if (scopedStudentIds !== null) {
          if (!scopedStudentIds || scopedStudentIds.length === 0) {
            studentQ.whereRaw('1 = 0')
          } else {
            studentQ.whereIn('id', scopedStudentIds)
          }
        }
      })
      .where('status', 'PENDING')
      .count('* as total')
      .first()

    const overduePayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId)
        })
        if (scopedStudentIds !== null) {
          if (!scopedStudentIds || scopedStudentIds.length === 0) {
            studentQ.whereRaw('1 = 0')
          } else {
            studentQ.whereIn('id', scopedStudentIds)
          }
        }
      })
      .where((q) => {
        q.where('status', 'OVERDUE').orWhere((subQ) => {
          subQ.where('status', 'PENDING').where('dueDate', '<', now.toSQLDate()!)
        })
      })
      .count('* as total')
      .first()

    const upcomingPayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId)
        })
        if (scopedStudentIds !== null) {
          if (!scopedStudentIds || scopedStudentIds.length === 0) {
            studentQ.whereRaw('1 = 0')
          } else {
            studentQ.whereIn('id', scopedStudentIds)
          }
        }
      })
      .where('status', 'PENDING')
      .where('dueDate', '>=', now.toSQLDate()!)
      .where('dueDate', '<=', now.plus({ days: 7 }).toSQLDate()!)
      .count('* as total')
      .first()

    const revenueTrends = await this.buildRevenueTrends(schoolId, scopedStudentIds)
    const overdueAging = await this.buildOverdueAging(schoolId, scopedStudentIds)
    const payrollCosts = await this.buildPayrollCosts(schoolId)

    const breakEvenMonthlyCents = payrollCosts.totalCostCents
    const breakEvenGapCents = monthlyRevenue - breakEvenMonthlyCents
    const breakEvenStatus =
      breakEvenGapCents > 0 ? 'above' : breakEvenGapCents < 0 ? 'below' : 'balanced'

    return {
      totalStudents: Number(totalStudents?.$extras.total) || 0,
      activeStudents: Number(activeStudents?.$extras.total) || 0,
      activeAcademicPeriods: Number(activeAcademicPeriods?.$extras.total) || 0,
      totalTeachers: Number(totalTeachers?.$extras.total) || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      pendingPayments: Number(pendingPayments?.$extras.total) || 0,
      overduePayments: Number(overduePayments?.$extras.total) || 0,
      upcomingPayments: Number(upcomingPayments?.$extras.total) || 0,
      attendanceRate: 0,
      revenueTrends,
      overdueAging,
      payrollCosts,
      breakEvenMonthlyCents,
      breakEvenGapCents,
      breakEvenStatus,
    }
  }

  private async buildPayrollCosts(schoolId: string) {
    const schoolUsers = await db
      .from('User as u')
      .where('u.schoolId', schoolId)
      .where('u.active', true)
      .whereNull('u.deletedAt')
      .select('u.id', 'u.grossSalary')

    const schoolUserIds = schoolUsers.map((user) => String(user.id))
    if (!schoolUserIds.length) {
      return {
        teachersCostCents: 0,
        staffCostCents: 0,
        benefitsCostCents: 0,
        totalCostCents: 0,
      }
    }

    const teacherRows = await Teacher.query()
      .join('User', 'User.id', 'Teacher.id')
      .where('User.schoolId', schoolId)
      .where('User.active', true)
      .whereNull('User.deletedAt')
      .select('Teacher.id', 'Teacher.hourlyRate', 'User.grossSalary')

    const teacherIds = teacherRows.map((row) => String(row.id))

    const includedTeacherIds = new Set<string>()
    const estimatedMonthlyHours = 160
    const teachersCostCents = teacherRows.reduce((sum, teacherRow) => {
      const teacherId = String(teacherRow.id)
      const hourlyRate = Number(
        (teacherRow as any).$extras?.hourlyRate ?? (teacherRow as any).hourlyRate ?? 0
      )

      // Break-even e previsao: professor entra por hora-aula estimada mensal
      if (hourlyRate <= 0) {
        return sum
      }

      includedTeacherIds.add(teacherId)
      return sum + Math.round(hourlyRate * estimatedMonthlyHours * 100)
    }, 0)

    const includedStaffIds = schoolUsers
      .filter((user) => !teacherIds.includes(String(user.id)) && Number(user.grossSalary || 0) > 0)
      .map((user) => String(user.id))

    const staffCostCents = schoolUsers.reduce((sum, user) => {
      if (teacherIds.includes(String(user.id))) return sum
      const grossSalary = Number(user.grossSalary || 0)
      // Regra: funcionário sem salário definido não entra na conta
      if (grossSalary <= 0) return sum
      return sum + grossSalary
    }, 0)

    const benefitUserIds = [...new Set([...includedTeacherIds, ...includedStaffIds])]
    const benefits = benefitUserIds.length
      ? await EmployeeBenefit.query().whereIn('userId', benefitUserIds)
      : []
    const benefitsCostCents = benefits.reduce((sum, benefit) => {
      const value = Number(benefit.value || 0)
      const deductionPercentage = Number(benefit.deductionPercentage || 0)
      return sum + Math.round(value * (1 - deductionPercentage / 100))
    }, 0)

    const totalCostCents = teachersCostCents + staffCostCents + benefitsCostCents

    return {
      teachersCostCents,
      staffCostCents,
      benefitsCostCents,
      totalCostCents,
    }
  }

  private async buildRevenueTrends(schoolId: string, scopedStudentIds: string[] | null) {
    const now = DateTime.now().startOf('month')
    const points: Array<{
      label: string
      predictedAmountCents: number
      receivedAmountCents: number
    }> = []

    for (let i = 5; i >= 0; i--) {
      const monthDate = now.minus({ months: i })

      const predictedQuery = StudentPayment.query()
        .where('month', monthDate.month)
        .where('year', monthDate.year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .whereNotIn('type', ['AGREEMENT'])
        .whereHas('student', (studentQ) => {
          studentQ.whereHas('user', (userQ) =>
            userQ.where('schoolId', schoolId).whereNull('deletedAt')
          )
          if (scopedStudentIds !== null) {
            if (!scopedStudentIds.length) {
              studentQ.whereRaw('1 = 0')
            } else {
              studentQ.whereIn('id', scopedStudentIds)
            }
          }
        })
        .sum('amount as total')
        .first()

      const receivedQuery = StudentPayment.query()
        .where('status', 'PAID')
        .whereRaw('EXTRACT(MONTH FROM "paidAt") = ?', [monthDate.month])
        .whereRaw('EXTRACT(YEAR FROM "paidAt") = ?', [monthDate.year])
        .whereHas('student', (studentQ) => {
          studentQ.whereHas('user', (userQ) =>
            userQ.where('schoolId', schoolId).whereNull('deletedAt')
          )
          if (scopedStudentIds !== null) {
            if (!scopedStudentIds.length) {
              studentQ.whereRaw('1 = 0')
            } else {
              studentQ.whereIn('id', scopedStudentIds)
            }
          }
        })
        .sum('totalAmount as total')
        .first()

      const [predicted, received] = await Promise.all([predictedQuery, receivedQuery])

      points.push({
        label: monthDate.toFormat('LLL/yy'),
        predictedAmountCents: Math.round(Number(predicted?.$extras.total || 0)),
        receivedAmountCents: Math.round(Number(received?.$extras.total || 0)),
      })
    }

    return points
  }

  private async buildOverdueAging(schoolId: string, scopedStudentIds: string[] | null) {
    const today = DateTime.now().startOf('day')

    const overduePayments = await StudentPayment.query()
      .where((q) => {
        q.where('status', 'OVERDUE').orWhere((subQ) => {
          subQ.where('status', 'PENDING').where('dueDate', '<', today.toSQLDate()!)
        })
      })
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) =>
          userQ.where('schoolId', schoolId).whereNull('deletedAt')
        )
        if (scopedStudentIds !== null) {
          if (!scopedStudentIds.length) {
            studentQ.whereRaw('1 = 0')
          } else {
            studentQ.whereIn('id', scopedStudentIds)
          }
        }
      })

    const ranges = [
      { label: '0-30', count: 0, amountCents: 0 },
      { label: '31-60', count: 0, amountCents: 0 },
      { label: '61+', count: 0, amountCents: 0 },
    ]

    for (const payment of overduePayments) {
      if (!payment.dueDate) continue
      const daysOverdue = Math.floor(today.diff(payment.dueDate.startOf('day'), 'days').days)
      const amount = Number(payment.totalAmount || payment.amount || 0)

      if (daysOverdue <= 30) {
        ranges[0].count += 1
        ranges[0].amountCents += amount
      } else if (daysOverdue <= 60) {
        ranges[1].count += 1
        ranges[1].amountCents += amount
      } else {
        ranges[2].count += 1
        ranges[2].amountCents += amount
      }
    }

    return {
      ranges,
      totalCount: ranges.reduce((acc, range) => acc + range.count, 0),
      totalAmountCents: ranges.reduce((acc, range) => acc + range.amountCents, 0),
    }
  }
}
