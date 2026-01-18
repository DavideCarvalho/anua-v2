import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'

export default class ShowSchoolChainController {
  async handle({ params, response }: HttpContext) {
    const schoolChain = await SchoolChain.query()
      .where('id', params.id)
      .preload('schoolGroups')
      .preload('schools')
      .first()

    if (!schoolChain) {
      return response.notFound({ message: 'Rede de escolas não encontrada' })
    }

    return response.ok(schoolChain)
  }
}
