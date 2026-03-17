import { BaseTransformer } from '@adonisjs/core/transformers'
import type Level from '#models/level'
import SchoolTransformer from '#transformers/school_transformer'
import ContractTransformer from '#transformers/contract_transformer'
import ClassTransformer from '#transformers/class_transformer'

export default class LevelTransformer extends BaseTransformer<Level> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'order',
        'schoolId',
        'contractId',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school))?.depth(6),
      contract: ContractTransformer.transform(this.whenLoaded(this.resource.contract))?.depth(6),
      classes: ClassTransformer.transform(this.whenLoaded(this.resource.classes)),
    }
  }
}
