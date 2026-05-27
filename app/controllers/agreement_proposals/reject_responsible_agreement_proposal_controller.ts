import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AgreementProposal from '#models/agreement_proposal'
import StudentHasResponsible from '#models/student_has_responsible'
import AgreementProposalTransformer from '#transformers/agreement_proposal_transformer'
import AppException from '#exceptions/app_exception'
import { notifySchoolStaff } from '#services/agreement_proposal_notification_service'

export default class RejectResponsibleAgreementProposalController {
  async handle(ctx: HttpContext) {
    const { params, request, serialize } = ctx
    const user = ctx.effectiveUser ?? ctx.auth?.user
    if (!user) throw AppException.badRequest('Não autenticado')

    const proposal = await AgreementProposal.query()
      .where('id', params.id)
      .preload('student', (q) => q.preload('user'))
      .preload('invoices', (q) => q.preload('invoice'))
      .firstOrFail()

    if (proposal.status !== 'SENT_TO_RESPONSIBLE') {
      throw AppException.badRequest(
        `Proposta não pode ser recusada no status "${proposal.status}"`
      )
    }

    const isResponsible = await StudentHasResponsible.query()
      .where('studentId', proposal.studentId)
      .where('responsibleId', user.id)
      .where('isFinancial', true)
      .first()

    if (!isResponsible) {
      throw AppException.badRequest('Você não é responsável financeiro deste aluno')
    }

    proposal.status = 'REJECTED_BY_RESPONSIBLE'
    proposal.rejectedById = user.id
    proposal.rejectedAt = DateTime.now()
    proposal.rejectionReason = request.input('reason', '')
    await proposal.save()

    const studentName = proposal.student?.$preloaded?.user ? proposal.student.user.name : 'Aluno'
    notifySchoolStaff(proposal.schoolId, {
      type: 'AGREEMENT_PROPOSAL_REJECTED',
      title: 'Proposta de acordo recusada',
      message: `O responsável de ${studentName} recusou a proposta de acordo. Considere criar uma nova proposta com condições diferentes.`,
      data: { proposalId: proposal.id, studentId: proposal.studentId },
      actionUrl: '/escola/financeiro/inadimplencia',
    }).catch(() => {})

    return serialize(AgreementProposalTransformer.transform(proposal))
  }
}
