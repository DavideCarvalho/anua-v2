import { BaseTransformer } from '@adonisjs/core/transformers'
import type Scholarship from '#models/scholarship'
import SchoolTransformer from '#transformers/school_transformer'
import SchoolPartnerTransformer from '#transformers/school_partner_transformer'

export default class ScholarshipTransformer extends BaseTransformer<Scholarship> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'schoolPartnerId',
        'name',
        'enrollmentDiscountPercentage',
        'discountPercentage',
        'enrollmentDiscountValue',
        'discountValue',
        'discountType',
        'type',
        'isActive',
        'description',
        'code',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      schoolPartner: SchoolPartnerTransformer.transform(
        this.whenLoaded(this.resource.schoolPartner)
      ),
    }
  }
}
