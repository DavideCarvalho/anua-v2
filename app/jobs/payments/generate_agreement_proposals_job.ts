import { Job } from '@adonisjs/queue'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'
import AgreementProposal from '#models/agreement_proposal'
import AgreementProposalInvoice from '#models/agreement_proposal_invoice'

interface GenerateAgreementProposalsPayload {
  minOverdueDays?: number
}

export default class GenerateAgreementProposalsJob extends Job<GenerateAgreementProposalsPayload> {
  static readonly jobName = 'GenerateAgreementProposalsJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const minDays = this.payload.minOverdueDays ?? 15
    const cutoffDate = DateTime.now().minus({ days: minDays }).toSQLDate()!

    logger.info('[PROPOSALS] Starting agreement proposal generation', { minDays })

    const overdueInvoices = await Invoice.query()
      .where('status', 'OVERDUE')
      .where('dueDate', '<', cutoffDate)
      .whereDoesntHave('payments', (q) => {
        q.where('type', 'AGREEMENT')
      })
      .preload('student')

    if (overdueInvoices.length === 0) {
      logger.info('[PROPOSALS] No overdue invoices eligible for proposals')
      return
    }

    const byStudent = new Map<string, typeof overdueInvoices>()
    for (const invoice of overdueInvoices) {
      const existing = byStudent.get(invoice.studentId) ?? []
      existing.push(invoice)
      byStudent.set(invoice.studentId, existing)
    }

    let created = 0
    let skipped = 0

    for (const [studentId, invoices] of byStudent) {
      if (invoices.length < 2) {
        skipped++
        continue
      }

      const activeProposal = await AgreementProposal.query()
        .where('studentId', studentId)
        .whereIn('status', ['PENDING_SCHOOL_APPROVAL', 'APPROVED', 'SENT_TO_RESPONSIBLE'])
        .first()

      if (activeProposal) {
        skipped++
        continue
      }

      const student = invoices[0].student
      const contractId = student.contractId ?? invoices[0].contractId
      let schoolId: string | null = null

      if (contractId) {
        const contract = await Contract.find(contractId)
        schoolId = contract?.schoolId ?? null
      }

      if (!schoolId) {
        const enrollment = await StudentHasLevel.query()
          .where('studentId', studentId)
          .preload('contract')
          .first()
        schoolId = enrollment?.contract?.schoolId ?? null
      }

      if (!schoolId) {
        logger.warn(`[PROPOSALS] Student ${studentId} has no school, skipping`)
        skipped++
        continue
      }

      const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
      const maxOverdueDays = Math.max(
        ...invoices.map((inv) => Math.floor(DateTime.now().diff(inv.dueDate, 'days').days))
      )
      const installments = totalAmount > 50000 ? 3 : 2

      const trx = await db.transaction()
      try {
        const proposal = await AgreementProposal.create(
          {
            schoolId,
            studentId,
            status: 'PENDING_SCHOOL_APPROVAL',
            totalAmount,
            installments,
            overdueDays: maxOverdueDays,
            expiresAt: DateTime.now().plus({ days: 30 }),
          },
          { client: trx }
        )

        for (const invoice of invoices) {
          const days = Math.floor(DateTime.now().diff(invoice.dueDate, 'days').days)
          await AgreementProposalInvoice.create(
            {
              proposalId: proposal.id,
              invoiceId: invoice.id,
              amount: Number(invoice.totalAmount),
              overdueDays: days,
            },
            { client: trx }
          )
        }

        await trx.commit()
        created++
      } catch (error) {
        await trx.rollback()
        logger.error(`[PROPOSALS] Failed to create proposal for student ${studentId}`, {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    logger.info('[PROPOSALS] Proposal generation completed', { created, skipped })
  }
}
