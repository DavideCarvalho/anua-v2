import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'

export default class DeleteSchoolChainController {
  async handle({ params, response }: HttpContext) {
    const schoolChain = await SchoolChain.find(params.id)

    if (!schoolChain) {
      return response.notFound({ message: 'Rede de escolas não encontrada' })
    }

    await schoolChain.delete()

    return response.noContent()
  }
}
