import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import AgreementProposal from '#models/agreement_proposal'
import AgreementProposalInvoice from '#models/agreement_proposal_invoice'
import AppException from '#exceptions/app_exception'

export default class CreateAgreementProposalController {
  async handle(ctx: HttpContext) {
    const { request, response } = ctx
    const schoolIds = ctx.selectedSchoolIds ?? []

    const { invoiceIds, installments } = request.only(['invoiceIds', 'installments'])

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length < 2) {
      throw AppException.badRequest('Selecione pelo menos 2 faturas')
    }

    const invoices = await Invoice.query()
      .whereIn('id', invoiceIds)
      .where('status', 'OVERDUE')
      .preload('student')

    if (invoices.length !== invoiceIds.length) {
      throw AppException.badRequest('Algumas faturas não são OVERDUE ou não foram encontradas')
    }

    const studentIds = new Set(invoices.map((i) => i.studentId))
    if (studentIds.size > 1) {
      throw AppException.badRequest('Todas as faturas devem ser do mesmo aluno')
    }

    const studentId = invoices[0].studentId

    const activeProposal = await AgreementProposal.query()
      .where('studentId', studentId)
      .whereIn('status', ['PENDING_SCHOOL_APPROVAL', 'APPROVED', 'SENT_TO_RESPONSIBLE'])
      .first()

    if (activeProposal) {
      throw AppException.badRequest('Já existe uma proposta ativa para este aluno')
    }

    const schoolId = schoolIds[0]
    if (!schoolId) throw AppException.badRequest('Escola não identificada')

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
    const maxOverdueDays = Math.max(
      ...invoices.map((inv) => Math.floor(DateTime.now().diff(inv.dueDate, 'days').days))
    )

    const trx = await db.transaction()
    try {
      const proposal = await AgreementProposal.create(
        {
          schoolId,
          studentId,
          status: 'PENDING_SCHOOL_APPROVAL',
          totalAmount,
          installments: installments ?? (totalAmount > 50000 ? 3 : 2),
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

      await proposal.load('student', (q) => q.preload('user'))
      await proposal.load('invoices', (q) => q.preload('invoice'))

      return response.created(proposal)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
