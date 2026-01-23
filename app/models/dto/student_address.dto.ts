import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentAddress from '#models/student_address'
import type { DateTime } from 'luxon'

export default class StudentAddressDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare street: string
  declare number: string
  declare complement: string | null
  declare neighborhood: string
  declare city: string
  declare state: string
  declare zipCode: string
  declare latitude: number | null
  declare longitude: number | null
  declare location: unknown | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentAddress) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.street = model.street
    this.number = model.number
    this.complement = model.complement
    this.neighborhood = model.neighborhood
    this.city = model.city
    this.state = model.state
    this.zipCode = model.zipCode
    this.latitude = model.latitude
    this.longitude = model.longitude
    this.location = model.location
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
