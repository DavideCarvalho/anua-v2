import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AcademicSubPeriod from '#models/academic_sub_period'
import School from '#models/school'
import type { PeriodStructure } from '#models/school'
import AppException from '#exceptions/app_exception'
import vine from '@vinejs/vine'

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

const diffSubPeriodsValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string(),
    schoolId: vine.string().optional(),
    periodStructure: vine.enum(['BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL']).optional(),
    currentSubPeriods: vine.array(vine.object({
      id: vine.string(),
      name: vine.string(),
      order: vine.number(),
      startDate: vine.string(),
      endDate: vine.string(),
    })).optional(),
  })
)

type SubPeriodInfo = {
  id: string
  name: string
  order: number
  startDate: string
  endDate: string
}

type DiffItem =
  | { type: 'added'; new: Omit<SubPeriodInfo, 'id'> }
  | { type: 'removed'; old: SubPeriodInfo }
  | { type: 'modified'; old: SubPeriodInfo; new: Omit<SubPeriodInfo, 'id'> }

function subPeriodToObject(subPeriod: AcademicSubPeriod): SubPeriodInfo {
  return {
    id: subPeriod.id,
    name: subPeriod.name,
    order: subPeriod.order,
    startDate: subPeriod.startDate.toISODate()!,
    endDate: subPeriod.endDate.toISODate()!,
  }
}

export default class DiffSubPeriodsController {
  async handle({ request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(diffSubPeriodsValidator)

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

    const existingSubPeriods: SubPeriodInfo[] = payload.currentSubPeriods
      ? payload.currentSubPeriods.sort((a, b) => a.order - b.order)
      : (await AcademicSubPeriod.query()
          .where('academicPeriodId', academicPeriod.id)
          .whereNull('deletedAt')
          .orderBy('order', 'asc'))
          .map(subPeriodToObject)

    const count = PERIOD_COUNT[periodStructure]
    const names = PERIOD_NAMES[periodStructure]
    const startDate = academicPeriod.startDate
    const endDate = academicPeriod.endDate

    const diff: DiffItem[] = []

    for (let i = 0; i < Math.max(existingSubPeriods.length, count); i++) {
      const existing = existingSubPeriods[i]
      const newName = names[i]

      if (!existing && newName) {
        const totalDays = endDate.diff(startDate, 'days').days
        const subPeriodDuration = totalDays / count
        const subStartDate = startDate.plus({ days: Math.round(subPeriodDuration * i) })
        const subEndDate =
          i === count - 1
            ? endDate
            : startDate.plus({ days: Math.round(subPeriodDuration * (i + 1)) - 1 })

        diff.push({
          type: 'added',
          new: {
            name: newName,
            order: i + 1,
            startDate: subStartDate.toISODate()!,
            endDate: subEndDate.toISODate()!,
          },
        })
      } else if (existing && !newName) {
        diff.push({
          type: 'removed',
          old: existing,
        })
      } else if (existing && newName) {
        const totalDays = endDate.diff(startDate, 'days').days
        const subPeriodDuration = totalDays / count
        const subStartDate = startDate.plus({ days: Math.round(subPeriodDuration * i) })
        const subEndDate =
          i === count - 1
            ? endDate
            : startDate.plus({ days: Math.round(subPeriodDuration * (i + 1)) - 1 })

        const newStartStr = subStartDate.toISODate()!
        const newEndStr = subEndDate.toISODate()!

        const nameChanged = existing.name !== newName
        const startDateChanged = existing.startDate !== newStartStr
        const endDateChanged = existing.endDate !== newEndStr

        if (nameChanged || startDateChanged || endDateChanged) {
          diff.push({
            type: 'modified',
            old: existing,
            new: {
              name: newName,
              order: i + 1,
              startDate: newStartStr,
              endDate: newEndStr,
            },
          })
        }
      }
    }

    return serialize({ data: diff })
  }
}
