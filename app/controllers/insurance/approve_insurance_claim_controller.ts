import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import { DateTime } from 'luxon'
import { approveInsuranceClaimValidator } from '#validators/insurance'

export default class ApproveInsuranceClaimController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { claimId, notes } = await request.validateUsing(approveInsuranceClaimValidator)

    const claim = await InsuranceClaim.find(claimId)

    if (!claim) {
      return response.notFound({ message: 'Sinistro não encontrado' })
    }

    if (claim.status !== 'PENDING') {
      return response.badRequest({
        message: 'Apenas sinistros pendentes podem ser aprovados',
      })
    }

    claim.status = 'APPROVED'
    claim.approvedAt = DateTime.now()
    claim.approvedBy = user.id
    if (notes) {
      claim.notes = notes
    }

    await claim.save()

    // TODO: Send email notification to school

    return response.ok({
      id: claim.id,
      status: claim.status,
      approvedAt: claim.approvedAt.toISO(),
      coveredAmount: claim.coveredAmount,
    })
  }
}
