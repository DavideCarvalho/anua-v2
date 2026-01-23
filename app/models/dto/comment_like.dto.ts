import { BaseModelDto } from '@adocasts.com/dto/base'
import type CommentLike from '#models/comment_like'
import type { DateTime } from 'luxon'

export default class CommentLikeDto extends BaseModelDto {
  declare id: string
  declare commentId: number
  declare userId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: CommentLike) {
    super()

    if (!model) return

    this.id = model.id
    this.commentId = model.commentId
    this.userId = model.userId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
