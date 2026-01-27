import { BaseModelDto } from '@adocasts.com/dto/base'

export class OccurrenceDto extends BaseModelDto {
  declare id: string
  declare type: string
  declare severity: string
  declare status: string
  declare title: string
  declare description: string
  declare resolutionNotes: string | null
  declare occurrenceDate: string
  declare resolvedAt: string | null
  declare responsibleNotified: boolean
  declare responsibleNotifiedAt: string | null
  declare responsibleAcknowledged: boolean
  declare responsibleAcknowledgedAt: string | null
  declare createdAt: string
  declare reporterName: string
  declare resolverName: string | null

  constructor(data: {
    id: string
    type: string
    severity: string
    status: string
    title: string
    description: string
    resolutionNotes: string | null
    occurrenceDate: string
    resolvedAt: string | null
    responsibleNotified: boolean
    responsibleNotifiedAt: string | null
    responsibleAcknowledged: boolean
    responsibleAcknowledgedAt: string | null
    createdAt: string
    reporterName: string
    resolverName: string | null
  }) {
    super()
    this.id = data.id
    this.type = data.type
    this.severity = data.severity
    this.status = data.status
    this.title = data.title
    this.description = data.description
    this.resolutionNotes = data.resolutionNotes
    this.occurrenceDate = data.occurrenceDate
    this.resolvedAt = data.resolvedAt
    this.responsibleNotified = data.responsibleNotified
    this.responsibleNotifiedAt = data.responsibleNotifiedAt
    this.responsibleAcknowledged = data.responsibleAcknowledged
    this.responsibleAcknowledgedAt = data.responsibleAcknowledgedAt
    this.createdAt = data.createdAt
    this.reporterName = data.reporterName
    this.resolverName = data.resolverName
  }
}

export class OccurrencesSummaryDto extends BaseModelDto {
  declare total: number
  declare open: number
  declare inProgress: number
  declare resolved: number
  declare dismissed: number
  declare critical: number
  declare high: number
  declare medium: number
  declare low: number
  declare unacknowledged: number

  constructor(data: {
    total: number
    open: number
    inProgress: number
    resolved: number
    dismissed: number
    critical: number
    high: number
    medium: number
    low: number
    unacknowledged: number
  }) {
    super()
    this.total = data.total
    this.open = data.open
    this.inProgress = data.inProgress
    this.resolved = data.resolved
    this.dismissed = data.dismissed
    this.critical = data.critical
    this.high = data.high
    this.medium = data.medium
    this.low = data.low
    this.unacknowledged = data.unacknowledged
  }
}

export class StudentOccurrencesResponseDto extends BaseModelDto {
  declare occurrences: OccurrenceDto[]
  declare summary: OccurrencesSummaryDto

  constructor(data: { occurrences: OccurrenceDto[]; summary: OccurrencesSummaryDto }) {
    super()
    this.occurrences = data.occurrences
    this.summary = data.summary
  }
}
