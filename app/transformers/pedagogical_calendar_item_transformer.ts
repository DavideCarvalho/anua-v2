import { BaseTransformer } from '@adonisjs/core/transformers'
import type AcademicPeriod from '#models/academic_period'
import type Class_ from '#models/class'
import type School from '#models/school'
import type Subject from '#models/subject'
import type Teacher from '#models/teacher'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import ClassTransformer from '#transformers/class_transformer'
import SchoolTransformer from '#transformers/school_transformer'
import SubjectTransformer from '#transformers/subject_transformer'
import TeacherTransformer from '#transformers/teacher_transformer'

export interface PedagogicalCalendarItem {
  sourceType: 'EVENT' | 'ASSIGNMENT' | 'EXAM' | 'HOLIDAY' | 'WEEKEND_CLASS_DAY'
  sourceId: string | null
  title: string
  description: string | null
  startAt: string
  endAt: string | null
  isAllDay: boolean
  readonly: boolean
  schoolId: string
  classId: string | null
  academicPeriodId: string | null
  teacherName?: string | null
  school?: School | null
  class?: Class_ | null
  subject?: Subject | null
  teacher?: Teacher | null
  academicPeriod?: AcademicPeriod | null
  meta: Record<string, unknown>
}

export default class PedagogicalCalendarItemTransformer extends BaseTransformer<PedagogicalCalendarItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'sourceType',
        'sourceId',
        'title',
        'description',
        'startAt',
        'endAt',
        'isAllDay',
        'readonly',
        'schoolId',
        'classId',
        'academicPeriodId',
        'teacherName',
        'meta',
      ]),
      school: SchoolTransformer.transform(this.resource.school ?? null),
      class: ClassTransformer.transform(this.resource.class ?? null),
      subject: SubjectTransformer.transform(this.resource.subject ?? null),
      teacher: TeacherTransformer.transform(this.resource.teacher ?? null),
      academicPeriod: AcademicPeriodTransformer.transform(this.resource.academicPeriod ?? null),
    }
  }
}
