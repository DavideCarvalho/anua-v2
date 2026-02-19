import { BaseModelDto } from '@adocasts.com/dto/base'
import type Comment from '#models/comment'
import type { DateTime } from 'luxon'

export default class CommentDto extends BaseModelDto {
  declare id: number
  declare uuid: string
  declare postId: number
  declare comment: string
  declare userId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: Comment) {
    super()

    if (!model) return

    this.id = model.id
    this.uuid = model.uuid
    this.postId = model.postId
    this.comment = model.comment
    this.userId = model.userId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
