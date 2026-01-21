import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import AcademicPeriod from './academic_period.js'
import CalendarSlot from './calendar_slot.js'

export default class Calendar extends BaseModel {
  static table = 'Calendar'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare classId: string

  @column()
  declare name: string

  @column()
  declare academicPeriodId: string

  @column()
  declare isActive: boolean

  @column()
  declare isCanceled: boolean

  @column()
  declare isApproved: boolean

  @column()
  declare canceledForNextCalendarId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => CalendarSlot, { foreignKey: 'calendarId' })
  declare slots: HasMany<typeof CalendarSlot>
}
