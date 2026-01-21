import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Teacher extends BaseModel {
  static table = 'Teacher'

  // Same ID as User (1:1 relationship)
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare hourlyRate: number

  // Relationships
  @belongsTo(() => User, { foreignKey: 'id' })
  declare user: BelongsTo<typeof User>

  // Note: Other relationships will be added when their models are created:
  // - TeacherHasClass
  // - TeacherAvailability
  // - TeacherHasSubject
  // - TeacherAbsence
}
