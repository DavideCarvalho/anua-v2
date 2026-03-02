import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import { listContractsValidator } from '#validators/contract'
import ContractTransformer from '#transformers/contract_transformer'
import AppException from '#exceptions/app_exception'

export default class ListContractsController {
  async handle({ request, auth, effectiveUser, selectedSchoolIds, serialize }: HttpContext) {
    const payload = await request.validateUsing(listContractsValidator)

    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    await user.load('role')
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role?.name || '')

    // Admins podem passar schoolId param, outros usam selectedSchoolIds do middleware
    const schoolIds = isAdmin
      ? payload.schoolId
        ? [payload.schoolId]
        : selectedSchoolIds
      : selectedSchoolIds

    if ((!schoolIds || schoolIds.length === 0) && !isAdmin) {
      throw AppException.badRequest('Usuário não vinculado a uma escola')
    }

    const page = payload.page || 1
    const limit = payload.limit || 20

    const query = Contract.query()
      .preload('school')
      .preload('paymentDays')
      .preload('interestConfig')
      .preload('earlyDiscounts')
      .orderBy('createdAt', 'desc')

    // Filtrar por escolas selecionadas
    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    if (payload.academicPeriodId) {
      query.whereRaw(
        `(
          "Contract"."academicPeriodId" = ?
          OR EXISTS (
            SELECT 1
            FROM "Level" l
            INNER JOIN "LevelAssignedToCourseHasAcademicPeriod" la ON la."levelId" = l."id"
            INNER JOIN "CourseHasAcademicPeriod" cap ON cap."id" = la."courseHasAcademicPeriodId"
            WHERE l."contractId" = "Contract"."id"
              AND la."isActive" = true
              AND cap."academicPeriodId" = ?
          )
        )`,
        [payload.academicPeriodId, payload.academicPeriodId]
      )
    }

    if (payload.courseId) {
      const bindings = payload.academicPeriodId
        ? [payload.courseId, payload.academicPeriodId]
        : [payload.courseId]

      query.whereRaw(
        `EXISTS (
          SELECT 1
          FROM "Level" l
          INNER JOIN "LevelAssignedToCourseHasAcademicPeriod" la ON la."levelId" = l."id"
          INNER JOIN "CourseHasAcademicPeriod" cap ON cap."id" = la."courseHasAcademicPeriodId"
          WHERE l."contractId" = "Contract"."id"
            AND la."isActive" = true
            AND cap."courseId" = ?
            ${payload.academicPeriodId ? 'AND cap."academicPeriodId" = ?' : ''}
        )`,
        bindings
      )
    }

    if (payload.classId) {
      const bindings = payload.academicPeriodId
        ? [payload.classId, payload.academicPeriodId]
        : [payload.classId]

      query.whereRaw(
        `EXISTS (
          SELECT 1
          FROM "Level" l
          INNER JOIN "Class" cls ON cls."levelId" = l."id"
          WHERE l."contractId" = "Contract"."id"
            AND cls."id" = ?
            AND cls."isArchived" = false
            ${
              payload.academicPeriodId
                ? `AND EXISTS (
                    SELECT 1
                    FROM "ClassHasAcademicPeriod" chap
                    WHERE chap."classId" = cls."id"
                      AND chap."academicPeriodId" = ?
                  )`
                : ''
            }
        )`,
        bindings
      )
    }

    if (payload.search) {
      query.where((searchQuery) => {
        searchQuery
          .whereILike('name', `%${payload.search}%`)
          .orWhereILike('description', `%${payload.search}%`)
      })
    }

    if (payload.status !== undefined) {
      if (payload.status === 'active') {
        query.where('isActive', true)
      } else if (payload.status === 'inactive') {
        query.where('isActive', false)
      }
    } else if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    } else {
      query.where('isActive', true)
    }

    const contracts = await query.paginate(page, limit)
    const data = contracts.all()
    const metadata = contracts.getMeta()

    return serialize(ContractTransformer.paginate(data, metadata))
  }
}
