import { BaseModelDto } from '@adocasts.com/dto/base'
import type PrintRequest from '#models/print_request'
import type { PrintRequestStatus } from '#models/print_request'
import type { DateTime } from 'luxon'

export default class PrintRequestDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare name: string
  declare path: string
  declare status: PrintRequestStatus
  declare frontAndBack: boolean
  declare rejectedFeedback: string | null
  declare quantity: number
  declare dueDate: DateTime
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(model?: PrintRequest) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.name = model.name
    this.path = model.path
    this.status = model.status
    this.frontAndBack = model.frontAndBack
    this.rejectedFeedback = model.rejectedFeedback
    this.quantity = model.quantity
    this.dueDate = model.dueDate
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
