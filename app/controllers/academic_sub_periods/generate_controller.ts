import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AcademicPeriod from '#models/academic_period'
import AcademicSubPeriod from '#models/academic_sub_period'
import Assignment from '#models/assignment'
import Exam from '#models/exam'
import School from '#models/school'
import type { PeriodStructure } from '#models/school'
import { generateSubPeriodsValidator } from '#validators/academic_sub_period'
import AppException from '#exceptions/app_exception'
import AcademicSubPeriodTransformer from '#transformers/academic_sub_period_transformer'

const PERIOD_NAMES: Record<string, string[]> = {
  BIMESTRAL: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'],
  TRIMESTRAL: ['1º Trimestre', '2º Trimestre', '3º Trimestre'],
  SEMESTRAL: ['1º Semestre', '2º Semestre'],
  ANUAL: ['Período Anual'],
}

const PERIOD_COUNT: Record<string, number> = {
  BIMESTRAL: 4,
  TRIMESTRAL: 3,
  SEMESTRAL: 2,
  ANUAL: 1,
}

export default class GenerateSubPeriodsController {
  async handle({ request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(generateSubPeriodsValidator)

    const schoolId = payload.schoolId ?? auth.user?.schoolId
    if (!schoolId) {
      throw AppException.badRequest('Usuário não possui escola')
    }

    const academicPeriod = await AcademicPeriod.query()
      .where('id', payload.academicPeriodId)
      .where('schoolId', schoolId)
      .whereNull('deletedAt')
      .first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    const school = await School.find(schoolId)
    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const periodStructure: PeriodStructure | null =
      payload.periodStructure ?? academicPeriod.periodStructure ?? school.periodStructure

    if (!periodStructure) {
      throw AppException.badRequest(
        'Nenhuma estrutura de períodos configurada. Configure no período letivo ou nas configurações da escola.'
      )
    }

    const count = PERIOD_COUNT[periodStructure]
    const names = PERIOD_NAMES[periodStructure]

    const startDate = academicPeriod.startDate
    const endDate = academicPeriod.endDate
    const totalDays = endDate.diff(startDate, 'days').days

    const subPeriodDuration = totalDays / count

    const minimumGrade = academicPeriod.minimumGradeOverride ?? school.minimumGrade ?? 6

    const existingCount = await db
      .from('AcademicSubPeriod')
      .where('academicPeriodId', academicPeriod.id)
      .whereNull('deletedAt')
      .count('* as total')

    const totalExisting = Number(existingCount[0].total ?? 0)

    if (totalExisting > 0 && !payload.overwrite) {
      throw AppException.badRequest(
        'Este período letivo já possui sub-períodos. Utilize o modo de substituição para regenerar.'
      )
    }

    if (payload.overwrite) {
      await AcademicSubPeriod.query()
        .where('academicPeriodId', academicPeriod.id)
        .whereNull('deletedAt')
        .update({ deletedAt: DateTime.now() })
    }

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
        weight: 1,
        minimumGrade,
        hasRecovery: false,
        schoolId,
        academicPeriodId: academicPeriod.id,
      })
      subPeriods.push(subPeriod)
    }

    for (const subPeriod of subPeriods) {
      const subStart = subPeriod.startDate.toISO()
      const subEnd = subPeriod.endDate.toISO()
      if (!subStart || !subEnd) continue

      let assignmentQuery = Assignment.query()
        .where('academicPeriodId', academicPeriod.id)
        .where('dueDate', '>=', subStart)
        .where('dueDate', '<=', subEnd)

      let examQuery = Exam.query()
        .where('academicPeriodId', academicPeriod.id)
        .where('examDate', '>=', subStart)
        .where('examDate', '<=', subEnd)

      if (payload.overwrite) {
        await assignmentQuery.update({ subPeriodId: subPeriod.id })
        await examQuery.update({ subPeriodId: subPeriod.id })
      } else {
        await assignmentQuery.whereNull('subPeriodId').update({ subPeriodId: subPeriod.id })
        await examQuery.whereNull('subPeriodId').update({ subPeriodId: subPeriod.id })
      }
    }

    const serialized = AcademicSubPeriodTransformer.transform(subPeriods)
    return serialize({ data: serialized })
  }
}
