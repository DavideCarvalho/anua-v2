import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'
import Comment from './comment.js'
import UserLikedPost from './user_liked_post.js'

export default class Post extends BaseModel {
  static table = 'Post'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare content: string

  @column()
  declare userId: string

  @column()
  declare schoolId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @hasMany(() => Comment, { foreignKey: 'postId' })
  declare comments: HasMany<typeof Comment>

  @hasMany(() => UserLikedPost, { foreignKey: 'postId' })
  declare likes: HasMany<typeof UserLikedPost>
}
