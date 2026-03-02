import { BaseTransformer } from '@adonisjs/core/transformers'
import type ResponsibleAddress from '#models/responsible_address'

export default class ResponsibleAddressTransformer extends BaseTransformer<ResponsibleAddress> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'responsibleId',
      'street',
      'number',
      'complement',
      'neighborhood',
      'city',
      'state',
      'zipCode',
      'latitude',
      'longitude',
      'location',
      'createdAt',
      'updatedAt',
    ])
  }
}
