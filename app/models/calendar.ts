import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import AcademicPeriod from './academic_period.js'
import CalendarSlot from './calendar_slot.js'

export default class Calendar extends BaseModel {
  static table = 'Calendar'

  @beforeCreate()
  static assignId(calendar: Calendar) {
    if (!calendar.id) {
      calendar.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'classId' })
  declare classId: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column({ columnName: 'isCanceled' })
  declare isCanceled: boolean

  @column({ columnName: 'isApproved' })
  declare isApproved: boolean

  @column({ columnName: 'canceledForNextCalendarId' })
  declare canceledForNextCalendarId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => CalendarSlot, { foreignKey: 'calendarId' })
  declare slots: HasMany<typeof CalendarSlot>
}
