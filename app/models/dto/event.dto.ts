import { BaseModelDto } from '@adocasts.com/dto/base'
import type Event from '#models/event'
import type { EventType, EventStatus, EventVisibility, EventPriority } from '#models/event'
import type EventAudience from '#models/event_audience'
import type { DateTime } from 'luxon'
import { resolveEventAudienceConfig } from '#services/events/event_audience_service'

export default class EventDto extends BaseModelDto {
  declare id: string
  declare title: string
  declare description: string | null
  declare shortDescription: string | null
  declare type: EventType
  declare status: EventStatus
  declare visibility: EventVisibility
  declare priority: EventPriority
  declare startDate: DateTime
  declare endDate: DateTime | null
  declare startTime: string | null
  declare endTime: string | null
  declare isAllDay: boolean
  declare location: string | null
  declare locationDetails: string | null
  declare isOnline: boolean
  declare onlineUrl: string | null
  declare isExternal: boolean
  declare organizerId: string | null
  declare maxParticipants: number | null
  declare currentParticipants: number
  declare requiresRegistration: boolean
  declare registrationDeadline: DateTime | null
  declare requiresParentalConsent: boolean
  declare hasAdditionalCosts: boolean
  declare additionalCostAmount: number | null
  declare additionalCostInstallments: number | null
  declare additionalCostDescription: string | null
  declare allowComments: boolean
  declare sendNotifications: boolean
  declare isRecurring: boolean
  declare recurringPattern: Record<string, unknown> | null
  declare bannerUrl: string | null
  declare attachments: Record<string, unknown>[] | null
  declare tags: string[] | null
  declare metadata: Record<string, unknown> | null
  declare schoolId: string
  declare createdBy: string
  declare audienceWholeSchool: boolean
  declare audienceAcademicPeriodIds: string[]
  declare audienceLevelIds: string[]
  declare audienceClassIds: string[]
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: Event) {
    super()

    if (!model) return

    this.id = model.id
    this.title = model.title
    this.description = model.description
    this.shortDescription = model.shortDescription
    this.type = model.type
    this.status = model.status
    this.visibility = model.visibility
    this.priority = model.priority
    this.startDate = model.startDate
    this.endDate = model.endDate
    this.startTime = model.startTime
    this.endTime = model.endTime
    this.isAllDay = model.isAllDay
    this.location = model.location
    this.locationDetails = model.locationDetails
    this.isOnline = model.isOnline
    this.onlineUrl = model.onlineUrl
    this.isExternal = model.isExternal
    this.organizerId = model.organizerId
    this.maxParticipants = model.maxParticipants
    this.currentParticipants = model.currentParticipants
    this.requiresRegistration = model.requiresRegistration
    this.registrationDeadline = model.registrationDeadline
    this.requiresParentalConsent = model.requiresParentalConsent
    this.hasAdditionalCosts = model.hasAdditionalCosts
    this.additionalCostAmount = model.additionalCostAmount
    this.additionalCostInstallments = model.additionalCostInstallments
    this.additionalCostDescription = model.additionalCostDescription
    this.allowComments = model.allowComments
    this.sendNotifications = model.sendNotifications
    this.isRecurring = model.isRecurring
    this.recurringPattern = model.recurringPattern
    this.bannerUrl = model.bannerUrl
    this.attachments = model.attachments
    this.tags = model.tags
    this.metadata = model.metadata
    this.schoolId = model.schoolId
    this.createdBy = model.createdBy

    const audience = resolveEventAudienceConfig(model.$preloaded.eventAudiences as EventAudience[])
    this.audienceWholeSchool = audience.audienceWholeSchool
    this.audienceAcademicPeriodIds = audience.audienceAcademicPeriodIds
    this.audienceLevelIds = audience.audienceLevelIds
    this.audienceClassIds = audience.audienceClassIds

    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
