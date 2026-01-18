import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Post from './post.js'
import CommentLike from './comment_like.js'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare content: string

  @column()
  declare authorId: string

  @column()
  declare postId: string

  @column()
  declare parentCommentId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Comment, { foreignKey: 'parentCommentId' })
  declare parentComment: BelongsTo<typeof Comment>

  @hasMany(() => Comment, { foreignKey: 'parentCommentId' })
  declare replies: HasMany<typeof Comment>

  @hasMany(() => CommentLike)
  declare likes: HasMany<typeof CommentLike>
}
