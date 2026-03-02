import { BaseTransformer } from '@adonisjs/core/transformers'
import type TeacherHasClass from '#models/teacher_has_class'
import TeacherTransformer from '#transformers/teacher_transformer'
import ClassTransformer from '#transformers/class_transformer'
import SubjectTransformer from '#transformers/subject_transformer'

export default class TeacherHasClassTransformer extends BaseTransformer<TeacherHasClass> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'teacherId',
        'classId',
        'subjectId',
        'subjectQuantity',
        'classWeekDay',
        'startTime',
        'endTime',
        'teacherAvailabilityId',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      teacher: TeacherTransformer.transform(this.whenLoaded(this.resource.teacher)),
      class: ClassTransformer.transform(this.whenLoaded(this.resource.class)),
      subject: SubjectTransformer.transform(this.whenLoaded(this.resource.subject)),
    }
  }
}
