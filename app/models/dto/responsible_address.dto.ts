import { BaseModelDto } from '@adocasts.com/dto/base'
import type ResponsibleAddress from '#models/responsible_address'
import UserDto from './user.dto.js'

export class ResponsibleAddressDto extends BaseModelDto {
  declare id: string
  declare responsibleId: string
  declare street: string
  declare number: string
  declare complement: string | null
  declare neighborhood: string
  declare city: string
  declare state: string
  declare zipCode: string
  declare latitude: number | null
  declare longitude: number | null
  declare createdAt: string
  declare updatedAt: string
  declare responsible?: UserDto

  constructor(instance?: ResponsibleAddress) {
    super()

    if (!instance) return

    this.id = instance.id
    this.responsibleId = instance.responsibleId
    this.street = instance.street
    this.number = instance.number
    this.complement = instance.complement
    this.neighborhood = instance.neighborhood
    this.city = instance.city
    this.state = instance.state
    this.zipCode = instance.zipCode
    this.latitude = instance.latitude
    this.longitude = instance.longitude
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
    this.responsible = instance.responsible ? new UserDto(instance.responsible) : undefined
  }
}

export class CreateResponsibleAddressDto extends BaseModelDto {
  declare responsibleId: string
  declare street: string
  declare number: string
  declare complement?: string
  declare neighborhood: string
  declare city: string
  declare state: string
  declare zipCode: string
  declare latitude?: number
  declare longitude?: number

  constructor(data: {
    responsibleId: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
  }) {
    super()
    this.responsibleId = data.responsibleId
    this.street = data.street
    this.number = data.number
    this.complement = data.complement
    this.neighborhood = data.neighborhood
    this.city = data.city
    this.state = data.state
    this.zipCode = data.zipCode
    this.latitude = data.latitude
    this.longitude = data.longitude
  }
}

export class UpdateResponsibleAddressDto extends BaseModelDto {
  declare street?: string
  declare number?: string
  declare complement?: string
  declare neighborhood?: string
  declare city?: string
  declare state?: string
  declare zipCode?: string
  declare latitude?: number
  declare longitude?: number

  constructor(data: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
  }) {
    super()
    this.street = data.street
    this.number = data.number
    this.complement = data.complement
    this.neighborhood = data.neighborhood
    this.city = data.city
    this.state = data.state
    this.zipCode = data.zipCode
    this.latitude = data.latitude
    this.longitude = data.longitude
  }
}
