import { BaseModelDto } from '@adocasts.com/dto/base'
import type Canteen from '#models/canteen'
import type { DateTime } from 'luxon'

export default class CanteenDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare responsibleUserId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(canteen?: Canteen) {
    super()

    if (!canteen) return

    this.id = canteen.id
    this.schoolId = canteen.schoolId
    this.responsibleUserId = canteen.responsibleUserId
    this.createdAt = canteen.createdAt.toJSDate()
    this.updatedAt = canteen.updatedAt.toJSDate()
  }
}
