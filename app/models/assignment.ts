import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import Subject from './subject.js'
import Teacher from './teacher.js'
import AssignmentSubmission from './assignment_submission.js'

export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export default class Assignment extends BaseModel {
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
  declare status: AssignmentStatus

  @column.dateTime()
  declare dueDate: DateTime

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

  @hasMany(() => AssignmentSubmission)
  declare submissions: HasMany<typeof AssignmentSubmission>
}
