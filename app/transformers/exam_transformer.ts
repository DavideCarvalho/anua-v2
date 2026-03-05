import { BaseTransformer } from '@adonisjs/core/transformers'
import type Exam from '#models/exam'
import ClassTransformer from '#transformers/class_transformer'
import SubjectTransformer from '#transformers/subject_transformer'
import TeacherTransformer from '#transformers/teacher_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import SchoolTransformer from '#transformers/school_transformer'
import ExamGradeTransformer from '#transformers/exam_grade_transformer'

export default class ExamTransformer extends BaseTransformer<Exam> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'description',
        'examDate',
        'startTime',
        'endTime',
        'location',
        'maxScore',
        'weight',
        'type',
        'status',
        'instructions',
        'schoolId',
        'classId',
        'subjectId',
        'teacherId',
        'academicPeriodId',
        'createdAt',
        'updatedAt',
      ]),
      gradesCount: Number(this.resource.$extras.gradesCount ?? 0),
      courseId:
        typeof this.resource.$extras.courseId === 'string' ? this.resource.$extras.courseId : null,
      class: ClassTransformer.transform(this.whenLoaded(this.resource.class)),
      subject: SubjectTransformer.transform(this.whenLoaded(this.resource.subject)),
      teacher: TeacherTransformer.transform(this.whenLoaded(this.resource.teacher)),
      academicPeriod: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriod)
      ),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      grades: ExamGradeTransformer.transform(this.whenLoaded(this.resource.grades)),
    }
  }
}
