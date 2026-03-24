import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ParentInquiry from './parent_inquiry.js'
import User from './user.js'
import ParentInquiryAttachment from './parent_inquiry_attachment.js'

export type ParentInquiryAuthorType = 'RESPONSIBLE' | 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'

export default class ParentInquiryMessage extends BaseModel {
  static table = 'ParentInquiryMessage'

  @beforeCreate()
  static assignId(model: ParentInquiryMessage) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'inquiryId' })
  declare inquiryId: string

  @column({ columnName: 'authorId' })
  declare authorId: string

  @column({ columnName: 'authorType' })
  declare authorType: ParentInquiryAuthorType

  @column({ columnName: 'body' })
  declare body: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => ParentInquiry, { foreignKey: 'inquiryId' })
  declare inquiry: BelongsTo<typeof ParentInquiry>

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @hasMany(() => ParentInquiryAttachment, { foreignKey: 'messageId' })
  declare attachments: HasMany<typeof ParentInquiryAttachment>
}
