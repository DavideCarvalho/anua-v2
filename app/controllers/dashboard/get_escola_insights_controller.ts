import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import StudentDocument from '#models/student_document'
import StudentHasLevel from '#models/student_has_level'
import StoreOrder from '#models/store_order'
import db from '@adonisjs/lucid/services/db'

type InsightPriority = 'high' | 'medium' | 'low'
type InsightType = 'financial' | 'enrollment' | 'academic'

interface Insight {
  id: string
  type: InsightType
  priority: InsightPriority
  title: string
  value: number
  description: string
  icon: string
  metadata?: Record<string, unknown>
}

export default class GetEscolaInsightsController {
  async handle({ selectedSchoolIds, request }: HttpContext) {
    const scopedSchoolIds = selectedSchoolIds ?? []
    if (scopedSchoolIds.length === 0) {
      return {
        insights: [],
        total: 0,
      }
    }

    const schoolId = scopedSchoolIds[0]
    const today = DateTime.now()
    const insights: Insight[] = []
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

    // ============================================
    // FINANCIAL INSIGHTS
    // ============================================

    // 1. Overdue payments (OVERDUE status or PENDING with dueDate < today)
    const overduePayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId).whereNull('deletedAt')
        })
      })
      .where((q) => {
        q.where('status', 'OVERDUE').orWhere((subQ) => {
          subQ.where('status', 'PENDING').where('dueDate', '<', today.toSQLDate()!)
        })
      })
      .if(scopedStudentIds !== null, (q) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          q.whereRaw('1 = 0')
          return
        }
        q.whereIn('studentId', scopedStudentIds)
      })
      .preload('student', (q) => q.preload('user'))

    if (overduePayments.length > 0) {
      // Calculate total overdue amount and average days overdue
      let totalOverdue = 0
      let totalDaysOverdue = 0

      for (const payment of overduePayments) {
        totalOverdue += payment.totalAmount
        const daysOverdue = Math.floor(today.diff(payment.dueDate, 'days').days)
        totalDaysOverdue += daysOverdue
      }

      const avgDaysOverdue = Math.round(totalDaysOverdue / overduePayments.length)

      // Priority based on average days overdue
      let priority: InsightPriority = 'low'
      if (avgDaysOverdue >= 30) priority = 'high'
      else if (avgDaysOverdue >= 7) priority = 'medium'

      insights.push({
        id: 'overdue-payments',
        type: 'financial',
        priority,
        title: 'Pagamentos Vencidos',
        value: overduePayments.length,
        description: `Em atraso (média ${avgDaysOverdue} dias)`,
        icon: 'alert-triangle',
        metadata: {
          totalAmount: totalOverdue,
          avgDaysOverdue,
          paymentIds: overduePayments.map((p) => p.id),
        },
      })
    }

    // 2. Payments due soon (next 7 days)
    const sevenDaysFromNow = today.plus({ days: 7 })
    const upcomingPayments = await StudentPayment.query()
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId).whereNull('deletedAt')
        })
      })
      .where('status', 'PENDING')
      .where('dueDate', '>=', today.toSQLDate()!)
      .where('dueDate', '<=', sevenDaysFromNow.toSQLDate()!)
      .if(scopedStudentIds !== null, (q) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          q.whereRaw('1 = 0')
          return
        }
        q.whereIn('studentId', scopedStudentIds)
      })

    if (upcomingPayments.length > 0) {
      let totalUpcoming = 0
      for (const payment of upcomingPayments) {
        totalUpcoming += payment.totalAmount
      }

      insights.push({
        id: 'upcoming-payments',
        type: 'financial',
        priority: 'low',
        title: 'Pagamentos Próximos',
        value: upcomingPayments.length,
        description: 'Vencem nos próximos 7 dias',
        icon: 'calendar-clock',
        metadata: {
          totalAmount: totalUpcoming,
          paymentIds: upcomingPayments.map((p) => p.id),
        },
      })
    }

    // 2.1 Chronic late payers (students with repeated late payment behavior)
    const latePayersQuery = db
      .from('StudentPayment as sp')
      .join('Student as st', 'st.id', 'sp.studentId')
      .join('User as u', 'u.id', 'st.id')
      .where('u.schoolId', schoolId)
      .whereNull('u.deletedAt')
      .where((q) => {
        q.where((paidLate) => {
          paidLate
            .where('sp.status', 'PAID')
            .whereNotNull('sp.paidAt')
            .whereRaw('DATE(sp."paidAt") > sp."dueDate"')
        })
          .orWhere('sp.status', 'OVERDUE')
          .orWhere((pendingOverdue) => {
            pendingOverdue
              .where('sp.status', 'PENDING')
              .where('sp.dueDate', '<', today.toSQLDate()!)
          })
      })
      .groupBy('sp.studentId')
      .havingRaw('COUNT(*) >= 2')
      .count('* as invoices')

    if (scopedStudentIds !== null) {
      if (!scopedStudentIds || scopedStudentIds.length === 0) {
        latePayersQuery.whereRaw('1 = 0')
      } else {
        latePayersQuery.whereIn('sp.studentId', scopedStudentIds)
      }
    }

    const latePayersRows = await latePayersQuery
    const chronicLatePayers = latePayersRows.length

    if (chronicLatePayers > 0) {
      insights.push({
        id: 'chronic-late-payers',
        type: 'financial',
        priority: chronicLatePayers >= 5 ? 'high' : 'medium',
        title: 'Recorrência de Atrasos',
        value: chronicLatePayers,
        description: `${chronicLatePayers} responsável(eis) com histórico de pagamento após vencimento. Priorize contato para renegociação preventiva.`,
        icon: 'alert-triangle',
      })
    }

    // 2.2 Upcoming due dates for historically late payers
    const riskyUpcomingQuery = db
      .from('StudentPayment as upcoming')
      .join('Student as st', 'st.id', 'upcoming.studentId')
      .join('User as u', 'u.id', 'st.id')
      .where('u.schoolId', schoolId)
      .whereNull('u.deletedAt')
      .where('upcoming.status', 'PENDING')
      .where('upcoming.dueDate', '>=', today.toSQLDate()!)
      .where('upcoming.dueDate', '<=', sevenDaysFromNow.toSQLDate()!)
      .whereExists((subQ) => {
        subQ
          .from('StudentPayment as history')
          .whereRaw('history."studentId" = upcoming."studentId"')
          .where((historyFilter) => {
            historyFilter
              .where((paidLate) => {
                paidLate
                  .where('history.status', 'PAID')
                  .whereNotNull('history.paidAt')
                  .whereRaw('DATE(history."paidAt") > history."dueDate"')
              })
              .orWhere('history.status', 'OVERDUE')
              .orWhere((pendingOverdue) => {
                pendingOverdue
                  .where('history.status', 'PENDING')
                  .where('history.dueDate', '<', today.toSQLDate()!)
              })
          })
      })
      .groupBy('upcoming.studentId')
      .count('* as upcomingInvoices')

    if (scopedStudentIds !== null) {
      if (!scopedStudentIds || scopedStudentIds.length === 0) {
        riskyUpcomingQuery.whereRaw('1 = 0')
      } else {
        riskyUpcomingQuery.whereIn('upcoming.studentId', scopedStudentIds)
      }
    }

    const riskyUpcomingRows = await riskyUpcomingQuery
    if (riskyUpcomingRows.length > 0) {
      insights.push({
        id: 'risky-upcoming-due-dates',
        type: 'financial',
        priority: riskyUpcomingRows.length >= 5 ? 'high' : 'medium',
        title: 'Vencimentos Sensíveis',
        value: riskyUpcomingRows.length,
        description: `${riskyUpcomingRows.length} responsável(eis) com histórico de pagamento em atraso têm boletos vencendo em até 7 dias.`,
        icon: 'calendar-clock',
      })
    }

    // ============================================
    // ENROLLMENT INSIGHTS
    // ============================================

    // 3. Pending document reviews
    const pendingDocuments = await StudentDocument.query()
      .where('status', 'PENDING')
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId).whereNull('deletedAt')
        })
      })
      .if(scopedStudentIds !== null, (q) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          q.whereRaw('1 = 0')
          return
        }
        q.whereIn('studentId', scopedStudentIds)
      })
      .preload('student', (q) => q.preload('user'))

    if (pendingDocuments.length > 0) {
      // Calculate average days pending
      let totalDaysPending = 0
      for (const doc of pendingDocuments) {
        const daysPending = Math.floor(today.diff(doc.createdAt, 'days').days)
        totalDaysPending += daysPending
      }
      const avgDaysPending = Math.round(totalDaysPending / pendingDocuments.length)

      // Priority based on average days pending
      let priority: InsightPriority = 'low'
      if (avgDaysPending >= 15) priority = 'high'
      else if (avgDaysPending >= 7) priority = 'medium'

      insights.push({
        id: 'pending-documents',
        type: 'enrollment',
        priority,
        title: 'Documentos Pendentes',
        value: pendingDocuments.length,
        description: `${pendingDocuments.length} documento(s) aguardando revisão (média ${avgDaysPending} dias)`,
        icon: 'file-clock',
        metadata: {
          avgDaysPending,
          documentIds: pendingDocuments.map((d) => d.id),
          studentIds: [...new Set(pendingDocuments.map((d) => d.studentId))],
        },
      })
    }

    // 4. Contracts awaiting signature
    const pendingSignatures = await StudentHasLevel.query()
      .whereNull('deletedAt')
      .where('docusealSignatureStatus', 'PENDING')
      .whereHas('student', (studentQ) => {
        studentQ.whereHas('user', (userQ) => {
          userQ.where('schoolId', schoolId).whereNull('deletedAt')
        })
      })
      .if(scopedStudentIds !== null, (q) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          q.whereRaw('1 = 0')
          return
        }
        q.whereIn('studentId', scopedStudentIds)
      })
      .preload('student', (q) => q.preload('user'))

    if (pendingSignatures.length > 0) {
      insights.push({
        id: 'pending-signatures',
        type: 'enrollment',
        priority: 'low',
        title: 'Contratos Aguardando Assinatura',
        value: pendingSignatures.length,
        description: `${pendingSignatures.length} contrato(s) pendente(s) de assinatura`,
        icon: 'file-signature',
        metadata: {
          studentLevelIds: pendingSignatures.map((sl) => sl.id),
          studentIds: [...new Set(pendingSignatures.map((sl) => sl.studentId))],
        },
      })
    }

    // 5. Pending enrollment status (PENDING_DOCUMENT_REVIEW)
    const pendingEnrollments = await db
      .from('Student')
      .join('User', 'Student.id', 'User.id')
      .where('User.schoolId', schoolId)
      .whereNull('User.deletedAt')
      .where('Student.enrollmentStatus', 'PENDING_DOCUMENT_REVIEW')
      .if(scopedStudentIds !== null, (q) => {
        if (!scopedStudentIds || scopedStudentIds.length === 0) {
          q.whereRaw('1 = 0')
          return
        }
        q.whereIn('Student.id', scopedStudentIds)
      })
      .count('* as total')
      .first()

    const pendingEnrollmentCount = Number(pendingEnrollments?.total) || 0
    if (pendingEnrollmentCount > 0) {
      insights.push({
        id: 'pending-enrollments',
        type: 'enrollment',
        priority: 'medium',
        title: 'Matrículas Pendentes',
        value: pendingEnrollmentCount,
        description: `${pendingEnrollmentCount} matrícula(s) aguardando revisão de documentos`,
        icon: 'user-clock',
      })
    }

    // ============================================
    // ACADEMIC INSIGHTS
    // ============================================

    const lowAttendanceQuery = db
      .from('StudentHasAttendance as sha')
      .join('Attendance as a', 'a.id', 'sha.attendanceId')
      .join('Student as st', 'st.id', 'sha.studentId')
      .join('Class as c', 'c.id', 'st.classId')
      .where('c.schoolId', schoolId)
      .where('a.date', '>=', today.minus({ days: 30 }).toSQLDate()!)
      .groupBy('sha.studentId')
      .havingRaw(
        "(COUNT(CASE WHEN sha.status = 'PRESENT' THEN 1 END)::float / NULLIF(COUNT(*),0)) < 0.75"
      )
      .count('* as records')

    if (scopedStudentIds !== null) {
      if (!scopedStudentIds || scopedStudentIds.length === 0) {
        lowAttendanceQuery.whereRaw('1 = 0')
      } else {
        lowAttendanceQuery.whereIn('sha.studentId', scopedStudentIds)
      }
    }

    const lowAttendanceRows = await lowAttendanceQuery
    if (lowAttendanceRows.length > 0) {
      insights.push({
        id: 'academic-low-attendance',
        type: 'academic',
        priority: lowAttendanceRows.length >= 8 ? 'high' : 'medium',
        title: 'Risco por Frequência',
        value: lowAttendanceRows.length,
        description: `${lowAttendanceRows.length} aluno(s) abaixo de 75% de frequência nos últimos 30 dias.`,
        icon: 'alert-triangle',
      })
    }

    // ============================================
    // STORE INSIGHTS
    // ============================================

    // 7. Store orders pending delivery (APPROVED but not yet delivered)
    const pendingDeliveryOrders = await StoreOrder.query()
      .where('schoolId', schoolId)
      .where('status', 'APPROVED')

    if (pendingDeliveryOrders.length > 0) {
      let totalDaysWaiting = 0
      for (const order of pendingDeliveryOrders) {
        const approvedDate = order.approvedAt ?? order.updatedAt
        const daysWaiting = Math.floor(today.diff(approvedDate, 'days').days)
        totalDaysWaiting += daysWaiting
      }
      const avgDaysWaiting = Math.round(totalDaysWaiting / pendingDeliveryOrders.length)

      let priority: InsightPriority = 'low'
      if (avgDaysWaiting >= 7) priority = 'high'
      else if (avgDaysWaiting >= 3) priority = 'medium'

      insights.push({
        id: 'pending-delivery-orders',
        type: 'financial',
        priority,
        title: 'Pedidos Pendentes de Entrega',
        value: pendingDeliveryOrders.length,
        description: `${pendingDeliveryOrders.length} pedido(s) aprovado(s) aguardando entrega (média ${avgDaysWaiting} dias)`,
        icon: 'package',
        metadata: {
          avgDaysWaiting,
          orderIds: pendingDeliveryOrders.map((o) => o.id),
        },
      })
    }

    // ============================================
    // SORT BY PRIORITY
    // ============================================
    const priorityOrder: Record<InsightPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    }

    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return {
      insights,
      total: insights.length,
    }
  }
}
