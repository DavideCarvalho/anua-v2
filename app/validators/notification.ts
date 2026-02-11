import vine from '@vinejs/vine'

// Notification Types
const notificationTypes = [
  'ASSIGNMENT_CREATED',
  'ASSIGNMENT_SUBMITTED',
  'ASSIGNMENT_GRADED',
  'EXAM_SCHEDULED',
  'EXAM_GRADE_AVAILABLE',
  'ATTENDANCE_MARKED',
  'PAYMENT_DUE',
  'PAYMENT_RECEIVED',
  'PAYMENT_OVERDUE',
  'EVENT_CREATED',
  'EVENT_REMINDER',
  'POST_LIKED',
  'POST_COMMENTED',
  'COMMENT_REPLIED',
  'POINTS_EARNED',
  'LEVEL_UP',
  'ACHIEVEMENT_UNLOCKED',
  'STREAK_MILESTONE',
  'STORE_ORDER_STATUS',
  'ABSENCE_REPORTED',
  'SCHEDULE_CHANGED',
  'SYSTEM_ANNOUNCEMENT',
  'MAINTENANCE_SCHEDULED',
] as const

const notificationChannels = ['IN_APP', 'EMAIL', 'PUSH', 'SMS', 'WHATSAPP'] as const
const notificationStatuses = ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'] as const

// List Notifications Validator
export const listNotificationsValidator = vine.compile(
  vine.object({
    type: vine.enum(notificationTypes).optional(),
    channel: vine.enum(notificationChannels).optional(),
    status: vine.enum(notificationStatuses).optional(),
    unreadOnly: vine.boolean().optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

// Create Notification Validator (for admin/system use)
export const createNotificationValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    content: vine.string().trim().minLength(1),
    type: vine.enum(notificationTypes),
    channel: vine.enum(notificationChannels),
    recipientId: vine.string(),
    metadata: vine.object({}).optional(),
    scheduledAt: vine.date().optional(),
  })
)

// Update Notification Preferences Validator
export const updateNotificationPreferencesValidator = vine.compile(
  vine.object({
    preferences: vine.array(
      vine.object({
        type: vine.enum(notificationTypes),
        channel: vine.enum(notificationChannels),
        enabled: vine.boolean(),
      })
    ),
  })
)
