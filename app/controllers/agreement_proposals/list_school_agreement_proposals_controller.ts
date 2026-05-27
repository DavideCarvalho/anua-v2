import type { HttpContext } from '@adonisjs/core/http'
import AgreementProposal from '#models/agreement_proposal'
import AgreementProposalTransformer from '#transformers/agreement_proposal_transformer'

export default class ListAgreementProposalsController {
  async handle(ctx: HttpContext) {
    const { request, serialize } = ctx
    const schoolIds = ctx.selectedSchoolIds ?? []
    const status = request.input('status')
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const query = AgreementProposal.query()
      .whereIn('schoolId', schoolIds)
      .preload('student', (q) => q.preload('user'))
      .preload('approvedBy')
      .preload('rejectedBy')
      .preload('invoices', (q) => q.preload('invoice'))
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    const proposals = await query.paginate(page, limit)

    return serialize(AgreementProposalTransformer.paginate(proposals.all(), proposals.getMeta()))
  }
}
