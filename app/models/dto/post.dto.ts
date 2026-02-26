import { BaseModelDto } from '@adocasts.com/dto/base'
import type Post from '#models/post'
import UserDto from './user.dto.js'
import SchoolDto from './school.dto.js'

export default class PostDto extends BaseModelDto {
  declare id: number
  declare uuid: string
  declare content: string
  declare userId: string
  declare schoolId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare user?: UserDto
  declare school?: SchoolDto
  declare likesCount?: number
  declare commentsCount?: number

  constructor(model?: Post) {
    super()

    if (!model) return

    this.id = model.id
    this.uuid = model.uuid
    this.content = model.content
    this.userId = model.userId
    this.schoolId = model.schoolId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
    this.user = model.user ? new UserDto(model.user) : undefined
    this.school = model.school ? new SchoolDto(model.school) : undefined
    this.likesCount = model.$extras.likes_count ? Number(model.$extras.likes_count) : undefined
    this.commentsCount = model.$extras.comments_count
      ? Number(model.$extras.comments_count)
      : undefined
  }
}
