import { DateTime } from 'luxon'

export type AnnouncementAcknowledgementStatus =
  | 'NOT_REQUIRED'
  | 'PENDING_ACK'
  | 'ACKNOWLEDGED'
  | 'EXPIRED_UNACKNOWLEDGED'

interface Input {
  requiresAcknowledgement: boolean
  acknowledgedAt: DateTime | null
  acknowledgementDueAt: DateTime | null
  now?: DateTime
}

export function getRecipientAcknowledgementStatus(input: Input): AnnouncementAcknowledgementStatus {
  if (!input.requiresAcknowledgement) {
    return 'NOT_REQUIRED'
  }

  if (input.acknowledgedAt) {
    return 'ACKNOWLEDGED'
  }

  if (input.acknowledgementDueAt && input.acknowledgementDueAt < (input.now ?? DateTime.now())) {
    return 'EXPIRED_UNACKNOWLEDGED'
  }

  return 'PENDING_ACK'
}
