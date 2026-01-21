import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import { resetSchoolInsuranceValidator } from '#validators/insurance'

export default class ResetSchoolInsuranceController {
  async handle({ request, response }: HttpContext) {
    const { schoolId } = await request.validateUsing(resetSchoolInsuranceValidator)

    const school = await School.find(schoolId)

    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    // Reset to inherit from chain
    school.hasInsurance = null
    school.insurancePercentage = null
    school.insuranceCoveragePercentage = null
    school.insuranceClaimWaitingDays = null

    await school.save()

    return response.ok({
      id: school.id,
      message: 'Configuração de seguro resetada para herdar da rede',
    })
  }
}
