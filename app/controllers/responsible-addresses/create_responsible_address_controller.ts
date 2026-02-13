import type { HttpContext } from '@adonisjs/core/http'
import { createResponsibleAddressValidator } from '#validators/responsible'
import ResponsibleAddress from '#models/responsible_address'
import User from '#models/user'
import { ResponsibleAddressDto } from '#models/dto/responsible_address.dto'
import AppException from '#exceptions/app_exception'

export default class CreateResponsibleAddressController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(createResponsibleAddressValidator)

    // Verificar se o usuário existe
    await User.findOrFail(payload.responsibleId)

    // Verificar se já existe um endereço para este responsável
    const existingAddress = await ResponsibleAddress.query()
      .where('responsibleId', payload.responsibleId)
      .first()

    if (existingAddress) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const address = await ResponsibleAddress.create(payload)

    await address.load('responsible')

    return new ResponsibleAddressDto(address)
  }
}
