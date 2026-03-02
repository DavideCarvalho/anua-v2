import { BaseTransformer } from '@adonisjs/core/transformers'
import type Challenge from '#models/challenge'
import SchoolTransformer from '#transformers/school_transformer'

export default class ChallengeTransformer extends BaseTransformer<Challenge> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'description',
        'icon',
        'points',
        'category',
        'criteria',
        'isRecurring',
        'recurrencePeriod',
        'startDate',
        'endDate',
        'schoolId',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
    }
  }
}
