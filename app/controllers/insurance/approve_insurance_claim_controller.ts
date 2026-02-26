import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import InsuranceClaimActionResponseDto from '#models/dto/insurance_claim_action_response.dto'
import { DateTime } from 'luxon'
import { approveInsuranceClaimValidator } from '#validators/insurance'
import AppException from '#exceptions/app_exception'

export default class ApproveInsuranceClaimController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { claimId, notes } = await request.validateUsing(approveInsuranceClaimValidator)

    const claim = await InsuranceClaim.find(claimId)

    if (!claim) {
      throw AppException.notFound('Sinistro não encontrado')
    }

    if (claim.status !== 'PENDING') {
      throw AppException.badRequest('Apenas sinistros pendentes podem ser aprovados')
    }

    claim.status = 'APPROVED'
    claim.approvedAt = DateTime.now()
    claim.approvedBy = user.id
    if (notes) {
      claim.notes = notes
    }

    await claim.save()

    // TODO: Send email notification to school

    return response.ok(new InsuranceClaimActionResponseDto(claim))
  }
}
