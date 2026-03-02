import { BaseTransformer } from '@adonisjs/core/transformers'
import type Occurrence from '#models/occurrence'

export default class OccurrenceTransformer extends BaseTransformer<Occurrence> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'studentId',
      'teacherHasClassId',
      'type',
      'text',
      'date',
      'createdAt',
      'updatedAt',
    ])
  }
}
