import { BaseModelDto } from '@adocasts.com/dto/base'
import type User from '#models/user'

export default class SchoolDirectorSummaryDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare email: string | null
  declare phone: string | null

  constructor(user?: User | null) {
    super()

    if (!user) return

    this.id = user.id
    this.name = user.name
    this.email = user.email
    this.phone = user.phone
  }
}
