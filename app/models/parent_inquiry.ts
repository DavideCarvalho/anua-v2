import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'
import School from './school.js'
import ParentInquiryMessage from './parent_inquiry_message.js'
import ParentInquiryRecipient from './parent_inquiry_recipient.js'

export type ParentInquiryStatus = 'OPEN' | 'RESOLVED' | 'CLOSED'

export default class ParentInquiry extends BaseModel {
  static table = 'ParentInquiry'

  @beforeCreate()
  static assignId(model: ParentInquiry) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'createdByResponsibleId' })
  declare createdByResponsibleId: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'subject' })
  declare subject: string

  @column({ columnName: 'status' })
  declare status: ParentInquiryStatus

  @column.dateTime({ columnName: 'resolvedAt' })
  declare resolvedAt: DateTime | null

  @column({ columnName: 'resolvedBy' })
  declare resolvedBy: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'createdByResponsibleId' })
  declare createdByResponsible: BelongsTo<typeof User>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'resolvedBy' })
  declare resolvedByUser: BelongsTo<typeof User>

  @hasMany(() => ParentInquiryMessage, { foreignKey: 'inquiryId' })
  declare messages: HasMany<typeof ParentInquiryMessage>

  @hasMany(() => ParentInquiryRecipient, { foreignKey: 'inquiryId' })
  declare recipients: HasMany<typeof ParentInquiryRecipient>
}
