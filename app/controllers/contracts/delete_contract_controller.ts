import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'

export default class DeleteContractController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const contract = await Contract.find(id)

    if (!contract) {
      return response.notFound({ message: 'Contract not found' })
    }

    await contract.delete()

    return response.noContent()
  }
}
