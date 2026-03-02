import { BaseTransformer } from '@adonisjs/core/transformers'
import type ExamGrade from '#models/exam_grade'
import StudentTransformer from '#transformers/student_transformer'
import ExamTransformer from '#transformers/exam_transformer'

export default class ExamGradeTransformer extends BaseTransformer<ExamGrade> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'examId',
        'studentId',
        'score',
        'attended',
        'feedback',
        'gradedAt',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      exam: ExamTransformer.transform(this.whenLoaded(this.resource.exam)),
    }
  }
}
