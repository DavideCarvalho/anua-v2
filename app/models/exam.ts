import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import Subject from './subject.js'
import Teacher from './teacher.js'
import School from './school.js'
import AcademicPeriod from './academic_period.js'
import ExamGrade from './exam_grade.js'

export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ExamType = 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ'
export type ExamLocation = 'CLASSROOM' | 'AUDITORIUM' | 'LABORATORY' | 'ONLINE' | 'OTHER'

export default class Exam extends BaseModel {
  static table = 'exams'

  @beforeCreate()
  static assignId(model: Exam) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.dateTime()
  declare examDate: DateTime

  @column.dateTime()
  declare startTime: DateTime | null

  @column.dateTime()
  declare endTime: DateTime | null

  @column()
  declare location: ExamLocation | null

  @column()
  declare maxScore: number

  @column()
  declare weight: number

  @column()
  declare type: ExamType

  @column()
  declare status: ExamStatus

  @column()
  declare instructions: string | null

  @column()
  declare schoolId: string

  @column()
  declare classId: string

  @column()
  declare subjectId: string | null

  @column()
  declare teacherId: string

  @column()
  declare academicPeriodId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => Subject, { foreignKey: 'subjectId' })
  declare subject: BelongsTo<typeof Subject>

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => ExamGrade, { foreignKey: 'examId' })
  declare grades: HasMany<typeof ExamGrade>
}
