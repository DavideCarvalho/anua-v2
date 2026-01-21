import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Role extends BaseModel {
  static table = 'Role'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  // Relationships
  @hasMany(() => User, { foreignKey: 'roleId' })
  declare users: HasMany<typeof User>
}
