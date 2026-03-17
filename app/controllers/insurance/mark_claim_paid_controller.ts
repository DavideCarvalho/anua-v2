import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
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

    return response.ok({
      id: claim.id,
      status: claim.status,
      approvedAt: claim.approvedAt ? claim.approvedAt.toISO() : null,
      rejectedAt: claim.rejectedAt ? claim.rejectedAt.toISO() : null,
      paidAt: claim.paidAt ? claim.paidAt.toISO() : null,
      coveredAmount: claim.coveredAmount,
      rejectionReason: claim.rejectionReason,
    })
  }
}
