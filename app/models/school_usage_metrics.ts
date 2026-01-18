import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'

export default class SchoolUsageMetrics extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare activeStudents: number

  @column()
  declare activeTeachers: number

  @column()
  declare activeUsers: number

  @column()
  declare classesCreated: number

  @column()
  declare assignmentsCreated: number

  @column()
  declare attendanceRecords: number

  @column()
  declare totalRevenue: number

  @column()
  declare totalEnrollments: number

  @column()
  declare loginCount: number

  @column.dateTime()
  declare lastActivityAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relationships
  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>
}
