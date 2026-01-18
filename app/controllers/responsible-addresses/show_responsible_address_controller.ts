import type { HttpContext } from '@adonisjs/core/http'
import ResponsibleAddress from '#models/responsible_address'
import { ResponsibleAddressDto } from '#models/dto/responsible_address.dto'

export default class ShowResponsibleAddressController {
  async handle({ params, response }: HttpContext) {
    const { responsibleId } = params

    const address = await ResponsibleAddress.query()
      .where('responsibleId', responsibleId)
      .preload('responsible')
      .first()

    if (!address) {
      return response.notFound({ message: 'Endereço não encontrado' })
    }

    return new ResponsibleAddressDto(address)
  }
}
