import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Assignment from './assignment.js'
import Student from './student.js'

export type SubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED' | 'LATE'

export default class AssignmentSubmission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare content: string | null

  @column()
  declare attachmentUrl: string | null

  @column()
  declare score: number | null

  @column()
  declare feedback: string | null

  @column()
  declare status: SubmissionStatus

  @column.dateTime()
  declare submittedAt: DateTime | null

  @column.dateTime()
  declare gradedAt: DateTime | null

  @column()
  declare assignmentId: string

  @column()
  declare studentId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Assignment)
  declare assignment: BelongsTo<typeof Assignment>

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
