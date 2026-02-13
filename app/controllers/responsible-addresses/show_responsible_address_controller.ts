import type { HttpContext } from '@adonisjs/core/http'
import ResponsibleAddress from '#models/responsible_address'
import { ResponsibleAddressDto } from '#models/dto/responsible_address.dto'
import AppException from '#exceptions/app_exception'

export default class ShowResponsibleAddressController {
  async handle({ params }: HttpContext) {
    const { responsibleId } = params

    const address = await ResponsibleAddress.query()
      .where('responsibleId', responsibleId)
      .preload('responsible')
      .first()

    if (!address) {
      throw AppException.notFound('Endereço não encontrado')
    }

    return new ResponsibleAddressDto(address)
  }
}
