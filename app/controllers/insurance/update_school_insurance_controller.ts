import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import InsuranceSchoolSettingsResponseDto from '#models/dto/insurance_school_settings_response.dto'
import { updateSchoolInsuranceValidator } from '#validators/insurance'
import AppException from '#exceptions/app_exception'

export default class UpdateSchoolInsuranceController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      hasInsurance,
      insurancePercentage,
      insuranceCoveragePercentage,
      insuranceClaimWaitingDays,
    } = await request.validateUsing(updateSchoolInsuranceValidator)

    const school = await School.find(schoolId)

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    if (hasInsurance !== undefined) {
      school.hasInsurance = hasInsurance
    }
    if (insurancePercentage !== undefined) {
      school.insurancePercentage = insurancePercentage
    }
    if (insuranceCoveragePercentage !== undefined) {
      school.insuranceCoveragePercentage = insuranceCoveragePercentage
    }
    if (insuranceClaimWaitingDays !== undefined) {
      school.insuranceClaimWaitingDays = insuranceClaimWaitingDays
    }

    await school.save()

    return response.ok(new InsuranceSchoolSettingsResponseDto(school))
  }
}
