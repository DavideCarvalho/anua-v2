import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentPayment from '#models/student_payment'
import StudentHasLevel from '#models/student_has_level'
import Invoice from '#models/invoice'
import AuditDto from '#models/dto/audit.dto'

export default class ListStudentAuditHistoryController {
  async handle({ params }: HttpContext) {
    const { studentId } = params

    // Get all entity IDs related to this student
    const enrollments = await StudentHasLevel.query()
      .where('studentId', studentId)
      .select('id', 'contractId')

    const payments = await StudentPayment.query().where('studentId', studentId).select('id')

    const invoices = await Invoice.query().where('studentId', studentId).select('id')

    const enrollmentIds = enrollments.map((e) => e.id)
    const paymentIds = payments.map((p) => p.id)
    const invoiceIds = invoices.map((i) => i.id)
    const contractIds = [
      ...new Set(enrollments.map((e) => e.contractId).filter((id): id is string => !!id)),
    ]

    // Build query for all related audits
    const query = db
      .from('audits')
      .where((builder) => {
        if (enrollmentIds.length > 0) {
          builder.orWhere((q) => {
            q.where('auditable_type', 'StudentHasLevel').whereIn('auditable_id', enrollmentIds)
          })
        }

        if (paymentIds.length > 0) {
          builder.orWhere((q) => {
            q.where('auditable_type', 'StudentPayment').whereIn('auditable_id', paymentIds)
          })
        }

        if (invoiceIds.length > 0) {
          builder.orWhere((q) => {
            q.where('auditable_type', 'Invoice').whereIn('auditable_id', invoiceIds)
          })
        }

        if (contractIds.length > 0) {
          builder.orWhere((q) => {
            q.where('auditable_type', 'Contract').whereIn('auditable_id', contractIds)
          })
        }
      })
      .orderBy('created_at', 'desc')
      .limit(100)

    const audits = await query

    return AuditDto.fromArray(audits)
  }
}
