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
  async handle({ selectedSchoolIds }: HttpContext) {
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

    // 6. Students with excessive absences (>20%)
    // Get all students with attendance records and calculate absence rate
    const attendanceStats = await db
      .from('StudentHasAttendance')
      .join('Attendance', 'StudentHasAttendance.attendanceId', 'Attendance.id')
      .join('Student', 'StudentHasAttendance.studentId', 'Student.id')
      .join('User', 'Student.id', 'User.id')
      .where('User.schoolId', schoolId)
      .whereNull('User.deletedAt')
      .select('StudentHasAttendance.studentId')
      .select(db.raw('COUNT(*) as total'))
      .select(
        db.raw(
          `SUM(CASE WHEN "StudentHasAttendance"."status" = 'ABSENT' THEN 1 ELSE 0 END) as absences`
        )
      )
      .groupBy('StudentHasAttendance.studentId')
      .having(db.raw('COUNT(*) >= 10')) // At least 10 attendance records

    const studentsWithHighAbsence = attendanceStats.filter((stat) => {
      const absenceRate = (Number(stat.absences) / Number(stat.total)) * 100
      return absenceRate > 20
    })

    if (studentsWithHighAbsence.length > 0) {
      insights.push({
        id: 'high-absence-rate',
        type: 'academic',
        priority: 'medium',
        title: 'Alunos com Muitas Faltas',
        value: studentsWithHighAbsence.length,
        description: `${studentsWithHighAbsence.length} aluno(s) com taxa de falta superior a 20%`,
        icon: 'user-x',
        metadata: {
          studentIds: studentsWithHighAbsence.map((s) => s.studentId),
        },
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
