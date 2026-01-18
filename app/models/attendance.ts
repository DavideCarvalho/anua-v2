import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import ClassSchedule from './class_schedule.js'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'

export default class Attendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare status: AttendanceStatus

  @column()
  declare justification: string | null

  @column()
  declare studentId: string

  @column()
  declare classScheduleId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => ClassSchedule)
  declare classSchedule: BelongsTo<typeof ClassSchedule>
}
