export type ParentalConsentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED'

export default class ParentalConsentDto {
  declare id: string
  declare eventId: string
  declare studentId: string
  declare status: ParentalConsentStatus
  declare createdAt: string | null | undefined
  declare expiresAt: string | null | undefined
  declare event: {
    id: string
    title: string
    description: string | null | undefined
    location: string | null | undefined
    type: string
    startDate: string | null | undefined
    endDate: string | null | undefined
    requiresParentalConsent: boolean
    school: {
      id: string
      name: string
    }
  }
  declare student: {
    id: string
    name: string
  }

  constructor(data: ParentalConsentDto) {
    this.id = data.id
    this.eventId = data.eventId
    this.studentId = data.studentId
    this.status = data.status
    this.createdAt = data.createdAt
    this.expiresAt = data.expiresAt
    this.event = data.event
    this.student = data.student
  }

  static fromArray(data: ParentalConsentDto[]): ParentalConsentDto[] {
    return data
  }
}
