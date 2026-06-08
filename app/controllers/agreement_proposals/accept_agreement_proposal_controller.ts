import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import AgreementProposal from '#models/agreement_proposal'
import Agreement from '#models/agreement'
import Invoice from '#models/invoice'
import StudentPayment from '#models/student_payment'
import StudentHasResponsible from '#models/student_has_responsible'
import AgreementProposalTransformer from '#transformers/agreement_proposal_transformer'
import AppException from '#exceptions/app_exception'
import { notifySchoolStaff } from '#services/agreement_proposal_notification_service'

export default class AcceptAgreementProposalController {
  async handle(ctx: HttpContext) {
    const { params, serialize } = ctx
    const user = ctx.effectiveUser ?? ctx.auth?.user
    if (!user) throw AppException.badRequest('Não autenticado')

    const proposal = await AgreementProposal.query()
      .where('id', params.id)
      .preload('student', (q) => q.preload('user'))
      .preload('invoices', (q) => q.preload('invoice', (iq) => iq.preload('payments')))
      .firstOrFail()

    if (proposal.status !== 'SENT_TO_RESPONSIBLE') {
      throw AppException.badRequest(`Proposta não pode ser aceita no status "${proposal.status}"`)
    }

    const isResponsible = await StudentHasResponsible.query()
      .where('studentId', proposal.studentId)
      .where('responsibleId', user.id)
      .where('isFinancial', true)
      .first()

    if (!isResponsible) {
      throw AppException.badRequest('Você não é responsável financeiro deste aluno')
    }

    const trx = await db.transaction()
    try {
      proposal.useTransaction(trx)
      proposal.status = 'ACCEPTED'
      proposal.acceptedAt = DateTime.now()
      await proposal.save()

      const startDate = DateTime.now().plus({ months: 1 }).set({ day: 10 })

      const agreement = await Agreement.create(
        {
          totalAmount: proposal.totalAmount,
          installments: proposal.installments,
          startDate,
          paymentDay: 10,
          billingType: 'UPFRONT',
          finePercentage: 0,
          dailyInterestPercentage: 0,
        },
        { client: trx }
      )

      for (const proposalInvoice of proposal.invoices) {
        const invoice = proposalInvoice.invoice
        invoice.useTransaction(trx)
        invoice.status = 'RENEGOTIATED'
        await invoice.save()

        for (const payment of invoice.payments) {
          if (['CANCELLED', 'RENEGOTIATED'].includes(payment.status)) continue
          payment.useTransaction(trx)
          payment.status = 'RENEGOTIATED'
          payment.metadata = {
            ...(payment.metadata || {}),
            renegotiatedReason: 'Substituído por acordo via proposta',
            agreementId: agreement.id,
            proposalId: proposal.id,
          }
          await payment.save()
        }
      }

      const studentId = proposal.studentId
      const contractId = proposal.invoices[0]?.invoice?.contractId ?? null
      const baseInstallmentAmount = Math.floor(proposal.totalAmount / proposal.installments)
      const installmentRemainder = proposal.totalAmount % proposal.installments

      for (let i = 0; i < proposal.installments; i++) {
        const installmentAmount = baseInstallmentAmount + (i < installmentRemainder ? 1 : 0)
        const dueDate = startDate.plus({ months: i })

        let invoiceForPeriod = await Invoice.query({ client: trx })
          .where('studentId', studentId)
          .where('month', dueDate.month)
          .where('year', dueDate.year)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
          .first()

        if (!invoiceForPeriod) {
          invoiceForPeriod = await Invoice.create(
            {
              studentId,
              contractId: null,
              type: 'MONTHLY',
              month: dueDate.month,
              year: dueDate.year,
              dueDate,
              status: 'OPEN',
              totalAmount: 0,
            },
            { client: trx }
          )
        }

        await StudentPayment.create(
          {
            studentId,
            amount: installmentAmount,
            totalAmount: installmentAmount,
            month: dueDate.month,
            year: dueDate.year,
            type: 'AGREEMENT',
            status: 'NOT_PAID',
            dueDate,
            installments: proposal.installments,
            installmentNumber: i + 1,
            contractId: contractId ?? undefined,
            agreementId: agreement.id,
            invoiceId: invoiceForPeriod.id,
          },
          { client: trx }
        )

        const linkedPayments = await StudentPayment.query({ client: trx })
          .where('invoiceId', invoiceForPeriod.id)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

        invoiceForPeriod.totalAmount = linkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        await invoiceForPeriod.useTransaction(trx).save()
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    const studentName = proposal.student?.$preloaded?.user ? proposal.student.user.name : 'Aluno'
    notifySchoolStaff(proposal.schoolId, {
      type: 'AGREEMENT_PROPOSAL_ACCEPTED',
      title: 'Proposta de acordo aceita',
      message: `O responsável de ${studentName} aceitou a proposta de acordo. As parcelas foram geradas automaticamente.`,
      data: { proposalId: proposal.id, studentId: proposal.studentId },
      actionUrl: '/escola/financeiro/inadimplencia',
    }).catch(() => {})

    await proposal.load('student', (q) => q.preload('user'))
    await proposal.load('invoices', (q) => q.preload('invoice'))

    return serialize(AgreementProposalTransformer.transform(proposal))
  }
}
