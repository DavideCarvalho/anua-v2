import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import Subject from './subject.js'
import Teacher from './teacher.js'
import ExamGrade from './exam_grade.js'

export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ExamType = 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ'

export default class Exam extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare instructions: string | null

  @column()
  declare maxScore: number

  @column()
  declare type: ExamType

  @column()
  declare status: ExamStatus

  @column.dateTime()
  declare scheduledDate: DateTime

  @column()
  declare durationMinutes: number | null

  @column()
  declare classId: string

  @column()
  declare subjectId: string

  @column()
  declare teacherId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Class_)
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>

  @belongsTo(() => Teacher)
  declare teacher: BelongsTo<typeof Teacher>

  @hasMany(() => ExamGrade)
  declare grades: HasMany<typeof ExamGrade>
}
