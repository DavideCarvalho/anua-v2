import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import AcademicSubPeriod from '#models/academic_sub_period'
import School from '#models/school'
import { generateSubPeriodsValidator } from '#validators/academic_sub_period'
import AppException from '#exceptions/app_exception'
import AcademicSubPeriodTransformer from '#transformers/academic_sub_period_transformer'

const PERIOD_NAMES: Record<string, string[]> = {
  BIMESTRAL: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'],
  TRIMESTRAL: ['1º Trimestre', '2º Trimestre', '3º Trimestre'],
  SEMESTRAL: ['1º Semestre', '2º Semestre'],
}

const PERIOD_COUNT: Record<string, number> = {
  BIMESTRAL: 4,
  TRIMESTRAL: 3,
  SEMESTRAL: 2,
}

export default class GenerateSubPeriodsController {
  async handle({ request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(generateSubPeriodsValidator)

    const schoolId = payload.schoolId ?? auth.user?.schoolId
    if (!schoolId) {
      throw AppException.badRequest('Usuário não possui escola')
    }

    const school = await School.find(schoolId)
    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    if (!school.periodStructure) {
      throw AppException.badRequest('Escola não possui estrutura de períodos configurada')
    }

    const academicPeriod = await AcademicPeriod.query()
      .where('id', payload.academicPeriodId)
      .where('schoolId', schoolId)
      .whereNull('deletedAt')
      .first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    const periodStructure = school.periodStructure
    const count = PERIOD_COUNT[periodStructure]
    const names = PERIOD_NAMES[periodStructure]

    const startDate = academicPeriod.startDate
    const endDate = academicPeriod.endDate
    const totalDays = endDate.diff(startDate, 'days').days

    const subPeriodDuration = totalDays / count
    const weight = 1

    const subPeriods: AcademicSubPeriod[] = []

    for (let i = 0; i < count; i++) {
      const subStartDate = startDate.plus({ days: Math.round(subPeriodDuration * i) })
      const subEndDate =
        i === count - 1
          ? endDate
          : startDate.plus({ days: Math.round(subPeriodDuration * (i + 1)) - 1 })

      const subPeriod = await AcademicSubPeriod.create({
        name: names[i],
        order: i + 1,
        startDate: subStartDate,
        endDate: subEndDate,
        weight,
        minimumGrade: school.minimumGrade ?? null,
        hasRecovery: false,
        schoolId,
        academicPeriodId: academicPeriod.id,
      })

      subPeriods.push(subPeriod)
    }

    return serialize(AcademicSubPeriodTransformer.collection(subPeriods))
  }
}
