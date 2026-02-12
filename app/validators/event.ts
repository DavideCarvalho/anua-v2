import vine from '@vinejs/vine'

// Event Types
const eventTypes = [
  'ACADEMIC_EVENT',
  'EXAM',
  'ASSIGNMENT',
  'FIELD_TRIP',
  'PARENTS_MEETING',
  'SCHOOL_CONFERENCE',
  'CULTURAL_EVENT',
  'SPORTS_EVENT',
  'ARTS_SHOW',
  'SCIENCE_FAIR',
  'TALENT_SHOW',
  'COMMUNITY_EVENT',
  'FUNDRAISING',
  'VOLUNTEER_DAY',
  'SCHOOL_PARTY',
  'STAFF_MEETING',
  'TRAINING',
  'SCHOOL_BOARD',
  'HEALTH_CHECK',
  'VACCINATION_DAY',
  'MENTAL_HEALTH',
  'OTHER',
] as const
const eventStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'POSTPONED'] as const
const eventVisibilities = [
  'PUBLIC',
  'INTERNAL',
  'STAFF_ONLY',
  'PARENTS_ONLY',
  'STUDENTS_ONLY',
  'SPECIFIC_CLASSES',
  'SPECIFIC_LEVELS',
] as const
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
    additionalCostInstallments: vine.number().min(1).max(12).optional(),
    additionalCostDescription: vine.string().trim().optional(),
    audienceWholeSchool: vine.boolean().optional(),
    audienceAcademicPeriodIds: vine.array(vine.string().trim()).optional(),
    audienceLevelIds: vine.array(vine.string().trim()).optional(),
    audienceClassIds: vine.array(vine.string().trim()).optional(),
    isAllDay: vine.boolean().optional(),
    startTime: vine.string().trim().optional().nullable(),
    endTime: vine.string().trim().optional().nullable(),
    isExternal: vine.boolean().optional(),
    startsAt: vine.string().trim(),
    endsAt: vine.string().trim().optional(),
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
    additionalCostInstallments: vine.number().min(1).max(12).optional().nullable(),
    additionalCostDescription: vine.string().trim().optional().nullable(),
    audienceWholeSchool: vine.boolean().optional(),
    audienceAcademicPeriodIds: vine.array(vine.string().trim()).optional(),
    audienceLevelIds: vine.array(vine.string().trim()).optional(),
    audienceClassIds: vine.array(vine.string().trim()).optional(),
    isAllDay: vine.boolean().optional(),
    startTime: vine.string().trim().optional().nullable(),
    endTime: vine.string().trim().optional().nullable(),
    isExternal: vine.boolean().optional(),
    startsAt: vine.string().trim().optional(),
    endsAt: vine.string().trim().optional().nullable(),
  })
)

// List Events Validator
export const listEventsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    type: vine.enum(eventTypes).optional(),
    status: vine.enum(eventStatuses).optional(),
    visibility: vine.enum(eventVisibilities).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
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
