import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export type PrintRequestStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PRINTED' | 'REVIEW'

export default class PrintRequest extends BaseModel {
  @beforeCreate()
  static assignId(model: PrintRequest) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare name: string

  @column()
  declare path: string

  @column()
  declare status: PrintRequestStatus

  @column()
  declare frontAndBack: boolean

  @column()
  declare rejectedFeedback: string | null

  @column()
  declare quantity: number

  @column.date()
  declare dueDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
