import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Calendar from './calendar.js'
import TeacherHasClass from './teacher_has_class.js'

export default class CalendarSlot extends BaseModel {
  static table = 'CalendarSlot'

  @beforeCreate()
  static assignId(calendarSlot: CalendarSlot) {
    if (!calendarSlot.id) {
      calendarSlot.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'teacherHasClassId' })
  declare teacherHasClassId: string | null

  @column({ columnName: 'classWeekDay' })
  declare classWeekDay: number // 0 = Sunday, 1 = Monday, etc.

  @column({ columnName: 'startTime' })
  declare startTime: string // time format from DB

  @column({ columnName: 'endTime' })
  declare endTime: string // time format from DB

  @column({ columnName: 'minutes' })
  declare minutes: number

  @column({ columnName: 'calendarId' })
  declare calendarId: string

  @column({ columnName: 'isBreak' })
  declare isBreak: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Calendar, { foreignKey: 'calendarId' })
  declare calendar: BelongsTo<typeof Calendar>

  @belongsTo(() => TeacherHasClass, { foreignKey: 'teacherHasClassId' })
  declare teacherHasClass: BelongsTo<typeof TeacherHasClass>
}
