import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import SchoolChain from '#models/school_chain'
import { getInsuranceConfigValidator } from '#validators/insurance'

export default class GetInsuranceConfigController {
  async handle({ request, response }: HttpContext) {
    const { schoolId } = await request.validateUsing(getInsuranceConfigValidator)

    const school = await School.query()
      .where('id', schoolId)
      .preload('schoolChain')
      .first()

    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    // Resolve hierarchical configuration
    const chain = school.schoolChain
    const config = this.resolveConfig(school, chain)

    return response.ok({
      schoolId: school.id,
      schoolName: school.name,
      chainId: chain?.id || null,
      chainName: chain?.name || null,
      config,
      source: {
        hasInsurance: school.hasInsurance !== null ? 'school' : chain ? 'chain' : 'default',
        insurancePercentage:
          school.insurancePercentage !== null ? 'school' : chain?.insurancePercentage ? 'chain' : 'default',
        insuranceCoveragePercentage:
          school.insuranceCoveragePercentage !== null
            ? 'school'
            : chain?.insuranceCoveragePercentage
              ? 'chain'
              : 'default',
        insuranceClaimWaitingDays:
          school.insuranceClaimWaitingDays !== null
            ? 'school'
            : chain?.insuranceClaimWaitingDays
              ? 'chain'
              : 'default',
      },
    })
  }

  private resolveConfig(school: School, chain: SchoolChain | null) {
    const hasInsurance =
      school.hasInsurance ?? chain?.hasInsuranceByDefault ?? false

    const insurancePercentage =
      school.insurancePercentage ?? chain?.insurancePercentage ?? 3

    const insuranceCoveragePercentage =
      school.insuranceCoveragePercentage ?? chain?.insuranceCoveragePercentage ?? 100

    const insuranceClaimWaitingDays =
      school.insuranceClaimWaitingDays ?? chain?.insuranceClaimWaitingDays ?? 90

    return {
      hasInsurance,
      insurancePercentage,
      insuranceCoveragePercentage,
      insuranceClaimWaitingDays,
    }
  }
}
