import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import { updateSchoolChainInsuranceValidator } from '#validators/insurance'

export default class UpdateSchoolChainInsuranceController {
  async handle({ request, response }: HttpContext) {
    const {
      chainId,
      hasInsuranceByDefault,
      insurancePercentage,
      insuranceCoveragePercentage,
      insuranceClaimWaitingDays,
    } = await request.validateUsing(updateSchoolChainInsuranceValidator)

    const chain = await SchoolChain.find(chainId)

    if (!chain) {
      return response.notFound({ message: 'Rede não encontrada' })
    }

    if (hasInsuranceByDefault !== undefined) {
      chain.hasInsuranceByDefault = hasInsuranceByDefault
    }
    if (insurancePercentage !== undefined) {
      chain.insurancePercentage = insurancePercentage
    }
    if (insuranceCoveragePercentage !== undefined) {
      chain.insuranceCoveragePercentage = insuranceCoveragePercentage
    }
    if (insuranceClaimWaitingDays !== undefined) {
      chain.insuranceClaimWaitingDays = insuranceClaimWaitingDays
    }

    await chain.save()

    return response.ok({
      id: chain.id,
      hasInsuranceByDefault: chain.hasInsuranceByDefault,
      insurancePercentage: chain.insurancePercentage,
      insuranceCoveragePercentage: chain.insuranceCoveragePercentage,
      insuranceClaimWaitingDays: chain.insuranceClaimWaitingDays,
    })
  }
}
