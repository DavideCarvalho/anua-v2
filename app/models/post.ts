import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'
import Comment from './comment.js'
import UserLikedPost from './user_liked_post.js'

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'ANNOUNCEMENT'
export type PostVisibility = 'PUBLIC' | 'SCHOOL_ONLY' | 'CLASS_ONLY' | 'PRIVATE'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare content: string

  @column()
  declare type: PostType

  @column()
  declare visibility: PostVisibility

  @column()
  declare attachmentUrl: string | null

  @column()
  declare authorId: string

  @column()
  declare schoolId: string

  @column()
  declare classId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasMany(() => UserLikedPost)
  declare likes: HasMany<typeof UserLikedPost>
}
