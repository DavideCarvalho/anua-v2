import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import InsuranceClaimActionResponseDto from '#models/dto/insurance_claim_action_response.dto'
import { DateTime } from 'luxon'
import { markClaimPaidValidator } from '#validators/insurance'
import AppException from '#exceptions/app_exception'

export default class MarkClaimPaidController {
  async handle({ request, response }: HttpContext) {
    const { claimId, notes } = await request.validateUsing(markClaimPaidValidator)

    const claim = await InsuranceClaim.find(claimId)

    if (!claim) {
      throw AppException.notFound('Sinistro não encontrado')
    }

    if (claim.status !== 'APPROVED') {
      throw AppException.badRequest('Apenas sinistros aprovados podem ser marcados como pagos')
    }

    claim.status = 'PAID'
    claim.paidAt = DateTime.now()
    if (notes) {
      claim.notes = notes
    }

    await claim.save()

    // TODO: Send email confirmation to school

    return response.ok(new InsuranceClaimActionResponseDto(claim))
  }
}
