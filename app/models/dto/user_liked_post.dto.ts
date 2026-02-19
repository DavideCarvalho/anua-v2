import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserLikedPost from '#models/user_liked_post'
import type { DateTime } from 'luxon'

export default class UserLikedPostDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare postId: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: UserLikedPost) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.postId = model.postId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
