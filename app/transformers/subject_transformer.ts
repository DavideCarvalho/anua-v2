import { BaseTransformer } from '@adonisjs/core/transformers'
import type Subject from '#models/subject'
import SchoolTransformer from '#transformers/school_transformer'

export default class SubjectTransformer extends BaseTransformer<Subject> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'quantityNeededScheduled',
        'schoolId',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
    }
  }
}
