import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentHasAttendance from '#models/student_has_attendance'
import StudentPayment from '#models/student_payment'
import CanteenPurchase from '#models/canteen_purchase'
import db from '@adonisjs/lucid/services/db'

export default class GetStudentOverviewController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .preload('student', (query) => {
        query.preload('user', (userQuery) => {
          userQuery.preload('school')
        })
        query.preload('class', (classQuery) => {
          classQuery.preload('level')
        })
      })
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Você não tem permissão para ver os dados deste aluno',
      })
    }

    const student = relation.student
    const hasPedagogicalAccess = relation.isPedagogical
    const hasFinancialAccess = relation.isFinancial

    // Dados pedagógicos (se tiver permissão)
    let pedagogicalData = null
    if (hasPedagogicalAccess) {
      // Calcular frequência (últimos 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const attendances = await StudentHasAttendance.query()
        .where('studentId', studentId)
        .whereHas('attendance', (query) => {
          query.where('date', '>=', thirtyDaysAgo.toISOString())
        })
        .preload('attendance')

      const totalDays = attendances.length
      const presentDays = attendances.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE'
      ).length
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

      // Próximas atividades (sem nota ainda e não atrasadas)
      const today = new Date()
      const upcomingAssignments = await db.rawQuery(
        `
        SELECT
          a.id,
          a.name as title,
          a."dueDate",
          s.name as subject_name
        FROM "StudentHasAssignment" sha
        JOIN "Assignment" a ON sha."assignmentId" = a.id
        JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
        JOIN "Subject" s ON thc."subjectId" = s.id
        WHERE sha."studentId" = :studentId
          AND sha.grade IS NULL
          AND a."dueDate" >= :today
        ORDER BY a."dueDate" ASC
        LIMIT 3
        `,
        { studentId, today: today.toISOString() }
      )

      const upcomingAssignmentsData = upcomingAssignments.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        subject: row.subject_name || 'Sem matéria',
        dueDate: row.dueDate,
      }))

      // Notas recentes
      const recentGrades = await db.rawQuery(
        `
        SELECT
          sha.id,
          sha.grade,
          a.name as assignment_title,
          a.grade as max_grade,
          s.name as subject_name,
          sha."updatedAt"
        FROM "StudentHasAssignment" sha
        JOIN "Assignment" a ON sha."assignmentId" = a.id
        JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
        JOIN "Subject" s ON thc."subjectId" = s.id
        WHERE sha."studentId" = :studentId
          AND sha.grade IS NOT NULL
        ORDER BY sha."updatedAt" DESC
        LIMIT 5
        `,
        { studentId }
      )

      pedagogicalData = {
        attendance: {
          percentage: attendancePercentage,
          totalDays,
          presentDays,
        },
        upcomingAssignments: upcomingAssignmentsData,
        recentGrades: recentGrades.rows.map((row: any) => ({
          subject: row.subject_name,
          grade: row.grade ? Number(row.grade) : null,
          maxGrade: row.max_grade ? Number(row.max_grade) : null,
          assignmentTitle: row.assignment_title,
          date: row.updatedAt,
        })),
      }
    }

    // Dados financeiros (se tiver permissão)
    let financialData = null
    if (hasFinancialAccess) {
      const payments = await StudentPayment.query()
        .where('studentId', studentId)
        .orderBy('dueDate', 'desc')
        .limit(5)

      const allPayments = await StudentPayment.query().where('studentId', studentId)

      const totalPending = allPayments
        .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE' || p.status === 'NOT_PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0)

      financialData = {
        recentPayments: payments.map((p) => ({
          id: p.id,
          description: `Mensalidade ${String(p.month).padStart(2, '0')}/${p.year}`,
          value: Number(p.amount),
          dueDate: p.dueDate,
          status: p.status === 'NOT_PAID' ? 'PENDING' : p.status, // Normalize status
          paymentDate: p.paidAt,
        })),
        totalPending,
      }
    }

    // Saldo da cantina - calcular baseado nas transações de saldo
    const balanceResult = await db.rawQuery(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'CREDIT' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type = 'DEBIT' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_debits
      FROM student_balance_transactions
      WHERE student_id = :studentId
      `,
      { studentId }
    )

    const totalCredits = Number(balanceResult.rows[0]?.total_credits || 0)
    const totalDebits = Number(balanceResult.rows[0]?.total_debits || 0)
    const canteenBalance = totalCredits - totalDebits

    // Calcular total gasto na cantina
    const purchases = await CanteenPurchase.query()
      .where('userId', student.user?.id)
      .sum('totalAmount as total')

    const totalSpent = purchases.length > 0 ? Number(purchases[0].$extras.total || 0) : 0

    return response.ok({
      student: {
        id: student.id,
        name: student.user?.name || 'Aluno',
        imageUrl: student.user?.imageUrl || null,
        school: student.user?.school?.name || null,
        level: student.class?.level?.name || null,
        className: student.class?.name || null,
      },
      permissions: {
        pedagogical: hasPedagogicalAccess,
        financial: hasFinancialAccess,
      },
      pedagogical: pedagogicalData,
      financial: financialData,
      canteen: {
        balance: canteenBalance,
        totalSpent,
      },
    })
  }
}
