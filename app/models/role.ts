import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Role extends BaseModel {
  static table = 'Role'

  @beforeCreate()
  static assignId(model: Role) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  // Relationships
  @hasMany(() => User, { foreignKey: 'roleId' })
  declare users: HasMany<typeof User>
}
