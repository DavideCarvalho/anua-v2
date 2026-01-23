import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserCredential from '#models/user_credential'
import type { DateTime } from 'luxon'

export default class UserCredentialDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare credentialId: string
  declare publicKey: Buffer
  declare counter: number
  declare deviceName: string | null
  declare transports: string[] | null
  declare createdAt: DateTime
  declare lastUsedAt: DateTime

  constructor(model?: UserCredential) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.credentialId = model.credentialId
    this.publicKey = model.publicKey
    this.counter = model.counter
    this.deviceName = model.deviceName
    this.transports = model.transports
    this.createdAt = model.createdAt
    this.lastUsedAt = model.lastUsedAt
  }
}
