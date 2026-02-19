import { BaseModelDto } from '@adocasts.com/dto/base'
import type CommentLike from '#models/comment_like'
import type { DateTime } from 'luxon'

export default class CommentLikeDto extends BaseModelDto {
  declare id: string
  declare commentId: number
  declare userId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: CommentLike) {
    super()

    if (!model) return

    this.id = model.id
    this.commentId = model.commentId
    this.userId = model.userId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
