import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import { DateTime } from 'luxon'
import { rejectInsuranceClaimValidator } from '#validators/insurance'

export default class RejectInsuranceClaimController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { claimId, rejectionReason } = await request.validateUsing(rejectInsuranceClaimValidator)

    const claim = await InsuranceClaim.find(claimId)

    if (!claim) {
      return response.notFound({ message: 'Sinistro não encontrado' })
    }

    if (claim.status !== 'PENDING') {
      return response.badRequest({
        message: 'Apenas sinistros pendentes podem ser rejeitados',
      })
    }

    claim.status = 'REJECTED'
    claim.rejectedAt = DateTime.now()
    claim.rejectedBy = user.id
    claim.rejectionReason = rejectionReason

    await claim.save()

    // TODO: Send email notification to school

    return response.ok({
      id: claim.id,
      status: claim.status,
      rejectedAt: claim.rejectedAt.toISO(),
      rejectionReason: claim.rejectionReason,
    })
  }
}
