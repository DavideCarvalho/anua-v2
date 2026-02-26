import { BaseModelDto } from '@adocasts.com/dto/base'
import type Comment from '#models/comment'
import UserDto from './user.dto.js'

export default class CommentDto extends BaseModelDto {
  declare id: number
  declare uuid: string
  declare postId: number
  declare comment: string
  declare userId: string
  declare createdAt: Date
  declare updatedAt: Date
  declare user?: UserDto
  declare likesCount?: number

  constructor(model?: Comment) {
    super()

    if (!model) return

    this.id = model.id
    this.uuid = model.uuid
    this.postId = model.postId
    this.comment = model.comment
    this.userId = model.userId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
    this.user = model.user ? new UserDto(model.user) : undefined
    this.likesCount = model.$extras.likes_count ? Number(model.$extras.likes_count) : undefined
  }
}
