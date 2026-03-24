import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ParentInquiry from './parent_inquiry.js'
import User from './user.js'

export type ParentInquiryRecipientType = 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'

export default class ParentInquiryRecipient extends BaseModel {
  static table = 'ParentInquiryRecipient'

  @beforeCreate()
  static assignId(model: ParentInquiryRecipient) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'inquiryId' })
  declare inquiryId: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'userType' })
  declare userType: ParentInquiryRecipientType

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => ParentInquiry, { foreignKey: 'inquiryId' })
  declare inquiry: BelongsTo<typeof ParentInquiry>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
