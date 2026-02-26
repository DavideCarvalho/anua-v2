import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import SchoolChainDto from '#models/dto/school_chain.dto'
import AppException from '#exceptions/app_exception'

export default class ShowSchoolChainController {
  async handle({ params, response }: HttpContext) {
    const schoolChain = await SchoolChain.query()
      .where('id', params.id)
      .preload('schoolGroups')
      .preload('schools')
      .first()

    if (!schoolChain) {
      throw AppException.notFound('Rede de escolas não encontrada')
    }

    return response.ok(new SchoolChainDto(schoolChain))
  }
}
