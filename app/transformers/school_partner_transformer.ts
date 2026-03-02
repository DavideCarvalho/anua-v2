import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolPartner from '#models/school_partner'
import SchoolTransformer from '#transformers/school_transformer'

export default class SchoolPartnerTransformer extends BaseTransformer<SchoolPartner> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'name',
        'cnpj',
        'email',
        'phone',
        'contactName',
        'discountPercentage',
        'partnershipStartDate',
        'partnershipEndDate',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
    }
  }
}
