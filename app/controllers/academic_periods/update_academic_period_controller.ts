import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import AcademicPeriod from '#models/academic_period'
import AcademicSubPeriod from '#models/academic_sub_period'
import { updateAcademicPeriodValidator } from '#validators/academic_period'
import AppException from '#exceptions/app_exception'
import { syncAcademicPeriodCourses } from '#services/academic_periods/sync_academic_period_courses_service'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class UpdateAcademicPeriodController {
  async handle({ request, params, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateAcademicPeriodValidator)

    const academicPeriod = await AcademicPeriod.find(params.id)
    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    academicPeriod.merge({
      name: payload.name ?? academicPeriod.name,
      startDate: payload.startDate
        ? DateTime.fromJSDate(payload.startDate)
        : academicPeriod.startDate,
      endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : academicPeriod.endDate,
      enrollmentStartDate:
        payload.enrollmentStartDate !== undefined
          ? payload.enrollmentStartDate
            ? DateTime.fromJSDate(payload.enrollmentStartDate)
            : null
          : academicPeriod.enrollmentStartDate,
      enrollmentEndDate:
        payload.enrollmentEndDate !== undefined
          ? payload.enrollmentEndDate
            ? DateTime.fromJSDate(payload.enrollmentEndDate)
            : null
          : academicPeriod.enrollmentEndDate,
      segment: payload.segment ?? academicPeriod.segment,
      previousAcademicPeriodId:
        payload.previousAcademicPeriodId !== undefined
          ? (payload.previousAcademicPeriodId ?? null)
          : academicPeriod.previousAcademicPeriodId,
      minimumGradeOverride:
        payload.minimumGradeOverride !== undefined
          ? (payload.minimumGradeOverride ?? null)
          : academicPeriod.minimumGradeOverride,
      minimumAttendanceOverride:
        payload.minimumAttendanceOverride !== undefined
          ? (payload.minimumAttendanceOverride ?? null)
          : academicPeriod.minimumAttendanceOverride,
      periodStructure:
        payload.periodStructure !== undefined
          ? (payload.periodStructure ?? null)
          : academicPeriod.periodStructure,
      recoveryGradeMethod:
        payload.recoveryGradeMethod !== undefined
          ? (payload.recoveryGradeMethod ?? null)
          : academicPeriod.recoveryGradeMethod,
      breakStartDate:
        payload.breakStartDate !== undefined
          ? payload.breakStartDate
            ? DateTime.fromJSDate(payload.breakStartDate)
            : null
          : academicPeriod.breakStartDate,
      breakEndDate:
        payload.breakEndDate !== undefined
          ? payload.breakEndDate
            ? DateTime.fromJSDate(payload.breakEndDate)
            : null
          : academicPeriod.breakEndDate,
      isActive: payload.isActive !== undefined ? payload.isActive : academicPeriod.isActive,
      isClosed: payload.isClosed !== undefined ? payload.isClosed : academicPeriod.isClosed,
    })

    await academicPeriod.save()

    if (payload.subPeriods && Array.isArray(payload.subPeriods) && payload.subPeriods.length > 0) {
      const existingSubPeriods = await AcademicSubPeriod.query()
        .where('academicPeriodId', academicPeriod.id)
        .whereNull('deletedAt')
        .orderBy('order', 'asc')

      const sameCount = existingSubPeriods.length === payload.subPeriods.length
      const sameNamesAndDates = sameCount && payload.subPeriods.every(
        (sp: any, i: number) => {
          const existing = existingSubPeriods[i]
          if (!existing) return false
          return (
            sp.name === existing.name &&
            new Date(sp.startDate).toISOString().slice(0, 10) === existing.startDate.toISO()?.slice(0, 10) &&
            new Date(sp.endDate).toISOString().slice(0, 10) === existing.endDate.toISO()?.slice(0, 10)
          )
        }
      )
      const sameNamesOnly = sameCount && payload.subPeriods.every(
        (sp: any, i: number) => sp.name === existingSubPeriods[i]?.name
      )

      if (!sameNamesAndDates) {
        if (sameNamesOnly) {
          // Only dates changed → update existing sub-periods
          for (let i = 0; i < payload.subPeriods.length; i++) {
            const sp = payload.subPeriods[i] as any
            const existing = existingSubPeriods[i]
            if (existing) {
              existing.merge({
                startDate: DateTime.fromJSDate(new Date(sp.startDate)),
                endDate: DateTime.fromJSDate(new Date(sp.endDate)),
                weight: sp.weight ?? existing.weight,
                minimumGrade: sp.minimumGrade ?? existing.minimumGrade,
                hasRecovery: sp.hasRecovery ?? existing.hasRecovery,
              })
              await existing.save()
            }
          }
        } else {
          // Structure changed → delete all and recreate
          const trx = await db.transaction()
          try {
            await AcademicSubPeriod.query({ client: trx })
              .where('academicPeriodId', academicPeriod.id)
              .whereNull('deletedAt')
              .update({ deletedAt: DateTime.now() })

            for (const sp of payload.subPeriods) {
              await AcademicSubPeriod.create(
                {
                  name: sp.name,
                  order: sp.order,
                  startDate: DateTime.fromJSDate(new Date(sp.startDate)),
                  endDate: DateTime.fromJSDate(new Date(sp.endDate)),
                  weight: sp.weight ?? 1,
                  minimumGrade: sp.minimumGrade ?? academicPeriod.minimumGradeOverride ?? null,
                  hasRecovery: sp.hasRecovery ?? false,
                  schoolId: academicPeriod.schoolId,
                  academicPeriodId: academicPeriod.id,
                },
                { client: trx }
              )
            }

            const newSubPeriods = await AcademicSubPeriod.query({ client: trx })
              .where('academicPeriodId', academicPeriod.id)
              .whereNull('deletedAt')
              .orderBy('order', 'asc')

            for (const subPeriod of newSubPeriods) {
              const subStart = subPeriod.startDate.toISO()
              const subEnd = subPeriod.endDate.toISO()
              if (!subStart || !subEnd) continue

              await db
                .from('Assignment')
                .useTransaction(trx)
                .whereNull('subPeriodId')
                .where('academicPeriodId', academicPeriod.id)
                .where('dueDate', '>=', subStart)
                .where('dueDate', '<=', subEnd)
                .update({ subPeriodId: subPeriod.id })

              await db
                .from('Exam')
                .useTransaction(trx)
                .whereNull('subPeriodId')
                .where('academicPeriodId', academicPeriod.id)
                .where('examDate', '>=', subStart)
                .where('examDate', '<=', subEnd)
                .update({ subPeriodId: subPeriod.id })
            }

            await trx.commit()
          } catch (error) {
            await trx.rollback()
            throw error
          }
        }
      }
    }

    if (payload.courses) {
      await syncAcademicPeriodCourses(
        academicPeriod,
        { courses: payload.courses },
        auth.user ? { id: auth.user.id, name: auth.user.name ?? 'Unknown' } : null
      )
    }

    return serialize(AcademicPeriodTransformer.transform(academicPeriod))
  }
}
