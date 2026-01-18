import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Absence from './absence.js'
import CalendarSlot from './calendar_slot.js'
import Teacher from './teacher.js'

export default class TeacherAbsence extends BaseModel {
  @beforeCreate()
  static assignId(model: TeacherAbsence) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare absenceId: string

  @column()
  declare calendarSlotId: string

  @column()
  declare teacherIdTookPlace: string | null

  @belongsTo(() => Absence)
  declare absence: BelongsTo<typeof Absence>

  @belongsTo(() => CalendarSlot)
  declare calendarSlot: BelongsTo<typeof CalendarSlot>

  @belongsTo(() => Teacher, { foreignKey: 'teacherIdTookPlace' })
  declare teacherTookPlace: BelongsTo<typeof Teacher>
}
