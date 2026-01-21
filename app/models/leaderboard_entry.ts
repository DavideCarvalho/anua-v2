import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Leaderboard from './leaderboard.js'
import Student from './student.js'

export default class LeaderboardEntry extends BaseModel {
  static table = 'LeaderboardEntry'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare leaderboardId: string

  @column()
  declare studentId: string

  @column()
  declare score: number

  @column()
  declare rank: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Leaderboard, { foreignKey: 'leaderboardId' })
  declare leaderboard: BelongsTo<typeof Leaderboard>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
