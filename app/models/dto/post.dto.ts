import { BaseModelDto } from '@adocasts.com/dto/base'
import type Post from '#models/post'

export default class PostDto extends BaseModelDto {
  declare id: number
  declare uuid: string
  declare content: string
  declare userId: string
  declare schoolId: string | null
  declare createdAt: Date
  declare updatedAt: Date

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
  }
}
