import type { HttpContext } from '@adonisjs/core/http'
import ResponsibleAddress from '#models/responsible_address'
import AppException from '#exceptions/app_exception'
import ResponsibleAddressTransformer from '#transformers/responsible_address_transformer'

export default class ShowResponsibleAddressController {
  async handle({ params, serialize }: HttpContext) {
    const { responsibleId } = params

    const address = await ResponsibleAddress.query()
      .where('responsibleId', responsibleId)
      .preload('responsible')
      .first()

    if (!address) {
      throw AppException.notFound('Endereço não encontrado')
    }

    return serialize(ResponsibleAddressTransformer.transform(address))
  }
}
