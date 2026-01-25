import vine from '@vinejs/vine'

// Event Types
const eventTypes = [
  'ACADEMIC',
  'SOCIAL',
  'SPORTS',
  'CULTURAL',
  'FIELD_TRIP',
  'MEETING',
  'GRADUATION',
] as const
const eventStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] as const
const eventVisibilities = ['PUBLIC', 'SCHOOL_ONLY', 'CLASS_ONLY', 'INVITE_ONLY'] as const
const participationStatuses = ['INVITED', 'CONFIRMED', 'DECLINED', 'ATTENDED', 'ABSENT'] as const

// Create Event Validator
export const createEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().optional(),
    location: vine.string().trim().maxLength(255).optional(),
    type: vine.enum(eventTypes),
    visibility: vine.enum(eventVisibilities).optional(),
    maxParticipants: vine.number().positive().optional(),
    requiresParentalConsent: vine.boolean().optional(),
    hasAdditionalCosts: vine.boolean().optional(),
    additionalCostAmount: vine.number().positive().optional(),
    additionalCostDescription: vine.string().trim().optional(),
    startsAt: vine.date(),
    endsAt: vine.date().optional(),
    schoolId: vine.string(),
  })
)

// Update Event Validator
export const updateEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().optional().nullable(),
    location: vine.string().trim().maxLength(255).optional().nullable(),
    type: vine.enum(eventTypes).optional(),
    visibility: vine.enum(eventVisibilities).optional(),
    maxParticipants: vine.number().positive().optional().nullable(),
    requiresParentalConsent: vine.boolean().optional(),
    hasAdditionalCosts: vine.boolean().optional(),
    additionalCostAmount: vine.number().positive().optional().nullable(),
    additionalCostDescription: vine.string().trim().optional().nullable(),
    startsAt: vine.date().optional(),
    endsAt: vine.date().optional().nullable(),
  })
)

// List Events Validator
export const listEventsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    type: vine.enum(eventTypes).optional(),
    status: vine.enum(eventStatuses).optional(),
    visibility: vine.enum(eventVisibilities).optional(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

// Register Participant Validator
export const registerParticipantValidator = vine.compile(
  vine.object({
    participantId: vine.string(),
    parentalConsent: vine.boolean().optional(),
  })
)

// Update Participant Status Validator
export const updateParticipantStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(participationStatuses),
    parentalConsent: vine.boolean().optional(),
  })
)

// List Participants Validator
export const listParticipantsValidator = vine.compile(
  vine.object({
    status: vine.enum(participationStatuses).optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)
