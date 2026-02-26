import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import InsuranceChainSettingsResponseDto from '#models/dto/insurance_chain_settings_response.dto'
import { updateSchoolChainInsuranceValidator } from '#validators/insurance'
import AppException from '#exceptions/app_exception'

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
      throw AppException.notFound('Rede não encontrada')
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

    return response.ok(new InsuranceChainSettingsResponseDto(chain))
  }
}
