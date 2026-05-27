import type { HttpContext } from '@adonisjs/core/http'
import AgreementProposal from '#models/agreement_proposal'
import StudentHasResponsible from '#models/student_has_responsible'
import AgreementProposalTransformer from '#transformers/agreement_proposal_transformer'

export default class ListStudentAgreementProposalsController {
  async handle(ctx: HttpContext) {
    const { params, response, serialize } = ctx
    const user = ctx.effectiveUser ?? ctx.auth?.user
    if (!user) return response.unauthorized()

    const studentId = params.studentId

    const isResponsible = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .where('responsibleId', user.id)
      .where('isFinancial', true)
      .first()

    if (!isResponsible) {
      return response.ok([])
    }

    const proposals = await AgreementProposal.query()
      .where('studentId', studentId)
      .whereIn('status', ['SENT_TO_RESPONSIBLE', 'ACCEPTED', 'REJECTED_BY_RESPONSIBLE'])
      .preload('student', (q) => q.preload('user'))
      .preload('invoices', (q) => q.preload('invoice'))
      .orderBy('createdAt', 'desc')

    return serialize(AgreementProposalTransformer.transform(proposals))
  }
}
