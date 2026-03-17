import { BaseTransformer } from '@adonisjs/core/transformers'
import type TeacherHasSubject from '#models/teacher_has_subject'
import SubjectTransformer from '#transformers/subject_transformer'

export default class TeacherHasSubjectTransformer extends BaseTransformer<TeacherHasSubject> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'teacherId', 'subjectId']),
      subject: SubjectTransformer.transform(this.whenLoaded(this.resource.subject))?.depth(6),
    }
  }
}
