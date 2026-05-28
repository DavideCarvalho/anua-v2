import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AgreementProposal from '#models/agreement_proposal'
import AgreementProposalTransformer from '#transformers/agreement_proposal_transformer'
import AppException from '#exceptions/app_exception'
import { rejectAgreementProposalValidator } from '#validators/agreement'

export default class RejectAgreementProposalController {
  async handle(ctx: HttpContext) {
    const { params, request, serialize } = ctx
    const user = ctx.auth?.user
    if (!user) throw AppException.badRequest('Não autenticado')

    const { reason } = await request.validateUsing(rejectAgreementProposalValidator)

    const proposal = await AgreementProposal.query()
      .where('id', params.id)
      .preload('student', (q) => q.preload('user'))
      .preload('invoices', (q) => q.preload('invoice'))
      .firstOrFail()

    if (proposal.status !== 'PENDING_SCHOOL_APPROVAL') {
      throw AppException.badRequest(
        `Proposta não pode ser rejeitada no status "${proposal.status}"`
      )
    }

    proposal.status = 'REJECTED_BY_SCHOOL'
    proposal.rejectedById = user.id
    proposal.rejectedAt = DateTime.now()
    proposal.rejectionReason = reason ?? ''
    await proposal.save()

    return serialize(AgreementProposalTransformer.transform(proposal))
  }
}
