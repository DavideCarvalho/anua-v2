import { BaseTransformer } from '@adonisjs/core/transformers'
import type Class_ from '#models/class'
import LevelTransformer from '#transformers/level_transformer'
import StudentTransformer from '#transformers/student_transformer'
import TeacherTransformer from '#transformers/teacher_transformer'
import TeacherHasClassTransformer from '#transformers/teacher_has_class_transformer'

export default class ClassTransformer extends BaseTransformer<Class_> {
  toObject() {
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
      level: LevelTransformer.transform(this.whenLoaded(this.resource.level))?.depth(6),
      students: StudentTransformer.transform(this.whenLoaded(this.resource.students)),
      teachers: TeacherTransformer.transform(this.whenLoaded(this.resource.teachers)),
      teacherClasses: TeacherHasClassTransformer.transform(
        this.whenLoaded(this.resource.teacherClasses)
      )?.depth(6),
    }
  }
}
