import { BaseTransformer } from '@adonisjs/core/transformers'
import type Canteen from '#models/canteen'
import SchoolTransformer from '#transformers/school_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class CanteenTransformer extends BaseTransformer<Canteen> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'schoolId',
        'responsibleUserId',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      responsibleUser: UserTransformer.transform(this.whenLoaded(this.resource.responsibleUser)),
    }
  }
}
