import { BaseTransformer } from '@adonisjs/core/transformers'
import type Class_ from '#models/class'

export default class ClassTransformer extends BaseTransformer<Class_> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'slug',
      'schoolId',
      'levelId',
      'isArchived',
      'createdAt',
      'updatedAt',
    ])
  }
}
