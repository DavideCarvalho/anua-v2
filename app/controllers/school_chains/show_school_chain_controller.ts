import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import AppException from '#exceptions/app_exception'
import SchoolChainTransformer from '#transformers/school_chain_transformer'

export default class ShowSchoolChainController {
  async handle({ params, response, serialize }: HttpContext) {
    const schoolChain = await SchoolChain.query()
      .where('id', params.id)
      .preload('schoolGroups')
      .preload('schools')
      .first()

    if (!schoolChain) {
      throw AppException.notFound('Rede de escolas não encontrada')
    }

    return response.ok(await serialize(SchoolChainTransformer.transform(schoolChain)))
  }
}
