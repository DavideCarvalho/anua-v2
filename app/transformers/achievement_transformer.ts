import { BaseTransformer } from '@adonisjs/core/transformers'
import type Achievement from '#models/achievement'
import SchoolTransformer from '#transformers/school_transformer'
import SchoolChainTransformer from '#transformers/school_chain_transformer'

export default class AchievementTransformer extends BaseTransformer<Achievement> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'slug',
        'name',
        'description',
        'icon',
        'points',
        'category',
        'criteria',
        'isSecret',
        'rarity',
        'maxUnlocks',
        'recurrencePeriod',
        'schoolId',
        'schoolChainId',
        'isActive',
        'deletedAt',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      schoolChain: SchoolChainTransformer.transform(this.whenLoaded(this.resource.schoolChain)),
    }
  }
}
