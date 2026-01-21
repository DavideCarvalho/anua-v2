import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import { updateSchoolInsuranceValidator } from '#validators/insurance'

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
      return response.notFound({ message: 'Escola não encontrada' })
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

    return response.ok({
      id: school.id,
      hasInsurance: school.hasInsurance,
      insurancePercentage: school.insurancePercentage,
      insuranceCoveragePercentage: school.insuranceCoveragePercentage,
      insuranceClaimWaitingDays: school.insuranceClaimWaitingDays,
    })
  }
}
