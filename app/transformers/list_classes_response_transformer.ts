import { BaseTransformer } from '@adonisjs/core/transformers'
import type Class_ from '#models/class'
import LevelTransformer from '#transformers/level_transformer'

export default class ListClassesResponseTransformer extends BaseTransformer<Class_> {
  toObject() {
    const studentsCount = (this.resource.$extras as Record<string, unknown>)?.studentLevels_count

    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'schoolId',
        'levelId',
        'isArchived',
        'createdAt',
        'updatedAt',
      ]),
      level: LevelTransformer.transform(this.whenLoaded(this.resource.level)),
      studentsCount: studentsCount ? Number(studentsCount) : 0,
    }
  }
}
