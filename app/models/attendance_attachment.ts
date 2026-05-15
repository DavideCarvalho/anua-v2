import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentHasAttendance from './student_has_attendance.js'
import User from './user.js'

export default class AttendanceAttachment extends BaseModel {
  static table = 'AttendanceAttachment'

  @beforeCreate()
  static assignId(model: AttendanceAttachment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentHasAttendanceId' })
  declare studentHasAttendanceId: string

  @column({ columnName: 'fileName' })
  declare fileName: string

  @attachment<AttendanceAttachment>({
    folder: (record) => `attendance/${record.studentHasAttendanceId}`,
    preComputeUrl: true,
  })
  declare file: Attachment | null

  @column({ columnName: 'mimeType' })
  declare mimeType: string

  @column({ columnName: 'fileSizeBytes' })
  declare fileSizeBytes: number

  @column({ columnName: 'uploadedById' })
  declare uploadedById: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => StudentHasAttendance, { foreignKey: 'studentHasAttendanceId' })
  declare studentHasAttendance: BelongsTo<typeof StudentHasAttendance>

  @belongsTo(() => User, { foreignKey: 'uploadedById' })
  declare uploadedBy: BelongsTo<typeof User>
}
