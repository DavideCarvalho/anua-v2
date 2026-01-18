import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ResponsibleAddress extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare responsibleId: string

  @column()
  declare street: string

  @column()
  declare number: string

  @column()
  declare complement: string | null

  @column()
  declare neighborhood: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare zipCode: string

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamento
  @belongsTo(() => User, {
    foreignKey: 'responsibleId',
  })
  declare responsible: BelongsTo<typeof User>
}
