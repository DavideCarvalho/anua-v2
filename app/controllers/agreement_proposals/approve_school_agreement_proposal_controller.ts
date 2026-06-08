import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AgreementProposal from '#models/agreement_proposal'
import StudentHasResponsible from '#models/student_has_responsible'
import { NotificationService } from '#services/notification_service'
import AgreementProposalTransformer from '#transformers/agreement_proposal_transformer'
import AppException from '#exceptions/app_exception'

export default class ApproveAgreementProposalController {
  async handle(ctx: HttpContext) {
    const { params, serialize } = ctx
    const user = ctx.auth?.user
    if (!user) throw AppException.badRequest('Não autenticado')

    const proposal = await AgreementProposal.query()
      .where('id', params.id)
      .preload('student')
      .preload('invoices', (q) => q.preload('invoice'))
      .firstOrFail()

    if (proposal.status !== 'PENDING_SCHOOL_APPROVAL') {
      throw AppException.badRequest(`Proposta não pode ser aprovada no status "${proposal.status}"`)
    }

    proposal.status = 'APPROVED'
    proposal.approvedById = user.id
    proposal.approvedAt = DateTime.now()
    await proposal.save()

    const financialResponsibles = await StudentHasResponsible.query()
      .where('studentId', proposal.studentId)
      .where('isFinancial', true)

    const totalFormatted = (proposal.totalAmount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    const notificationService = new NotificationService()
    for (const rel of financialResponsibles) {
      notificationService
        .send({
          userId: rel.responsibleId,
          type: 'AGREEMENT_PROPOSAL',
          title: 'Proposta de Acordo Disponível',
          message: `Sua escola disponibilizou uma proposta de acordo no valor de ${totalFormatted} em ${proposal.installments}x para faturas em atraso. Acesse o portal para aceitar.`,
          data: {
            proposalId: proposal.id,
            studentId: proposal.studentId,
            totalAmount: proposal.totalAmount,
            installments: proposal.installments,
          },
          actionUrl: '/financeiro',
        })
        .catch(() => {})
    }

    proposal.status = 'SENT_TO_RESPONSIBLE'
    proposal.sentAt = DateTime.now()
    await proposal.save()

    return serialize(AgreementProposalTransformer.transform(proposal))
  }
}
