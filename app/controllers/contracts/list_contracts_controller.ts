import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import { listContractsValidator } from '#validators/contract'
import { ContractDto } from '#models/dto/contract.dto'

export default class ListContractsController {
  async handle({ request, response, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const payload = await request.validateUsing(listContractsValidator)

    const user = effectiveUser ?? auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
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
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
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
      query.where('academicPeriodId', payload.academicPeriodId)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    const contracts = await query.paginate(page, limit)

    return ContractDto.fromPaginator(contracts)
  }
}
