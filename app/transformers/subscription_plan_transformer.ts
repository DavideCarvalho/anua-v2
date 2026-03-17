import { BaseTransformer } from '@adonisjs/core/transformers'
import type SubscriptionPlan from '#models/subscription_plan'

export default class SubscriptionPlanTransformer extends BaseTransformer<SubscriptionPlan> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'tier',
      'description',
      'monthlyPrice',
      'annualPrice',
      'maxStudents',
      'maxTeachers',
      'maxSchoolsInChain',
      'features',
      'isActive',
      'createdAt',
      'updatedAt',
    ])
  }
}
