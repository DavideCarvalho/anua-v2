import { Job } from '@boringnode/queue'
import db from '@adonisjs/lucid/services/db'
import Event from '#models/event'
import type EventModel from '#models/event'
import EventParentalConsent from '#models/event_parental_consent'
import Student from '#models/student'
import { resolveEventAudienceConfig } from '#services/events/event_audience_service'

interface SendEventInvitationsPayload {
  eventId: string
  triggeredBy?: { id: string; name: string } | null
  source?: string
}

export default class SendEventInvitationsJob extends Job<SendEventInvitationsPayload> {
  static readonly jobName = 'SendEventInvitationsJob'

  static options = {
    queue: 'notifications',
    maxRetries: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { eventId, source } = this.payload

    const event = await Event.query().where('id', eventId).preload('eventAudiences').first()

    if (!event) {
      console.warn(`[EVENT_INVITES] Event ${eventId} not found`)
      return
    }

    if (!event.requiresParentalConsent) {
      return
    }

    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      return
    }

    const students = await this.getAudienceStudents(event)

    let created = 0
    let skipped = 0
    let failed = 0

    for (const student of students) {
      const responsibleIds = this.getResponsibleIds(student)

      if (responsibleIds.length === 0) {
        skipped += 1
        continue
      }

      for (const responsibleId of responsibleIds) {
        try {
          const wasCreated = await this.createConsentIfMissing({
            eventId: event.id,
            studentId: student.id,
            responsibleId,
            expiresAt: event.startDate,
            source,
          })

          if (!wasCreated) {
            skipped += 1
            continue
          }

          created += 1
        } catch (error) {
          failed += 1
          console.error(
            `[EVENT_INVITES] Failed to create invite for event=${event.id} student=${student.id} responsible=${responsibleId}`,
            error
          )
        }
      }
    }

    console.info(
      `[EVENT_INVITES] event=${event.id} created=${created} skipped=${skipped} failed=${failed}`
    )
  }

  private async getAudienceStudents(event: EventModel) {
    const audience = resolveEventAudienceConfig(event.eventAudiences)

    const query = Student.query()
      .where('enrollmentStatus', 'REGISTERED')
      .whereHas('class', (classQ) => classQ.where('schoolId', event.schoolId))
      .preload('responsibles')

    if (audience.audienceWholeSchool) {
      return query
    }

    const hasAnySegment =
      audience.audienceAcademicPeriodIds.length > 0 ||
      audience.audienceLevelIds.length > 0 ||
      audience.audienceClassIds.length > 0

    if (!hasAnySegment) {
      return []
    }

    query.where((builder) => {
      if (audience.audienceClassIds.length > 0) {
        builder.orWhereIn('Student.classId', audience.audienceClassIds)
      }

      if (audience.audienceLevelIds.length > 0) {
        builder.orWhereHas('class', (classQ) => {
          classQ.whereIn('Class.levelId', audience.audienceLevelIds)
        })
      }

      if (audience.audienceAcademicPeriodIds.length > 0) {
        builder.orWhereHas('class', (classQ) => {
          classQ.whereHas('academicPeriods', (periodQ) => {
            periodQ.whereIn('AcademicPeriod.id', audience.audienceAcademicPeriodIds)
          })
        })
      }
    })

    return query
  }

  private getResponsibleIds(student: Student) {
    if (student.isSelfResponsible) {
      return [student.id]
    }

    return student.responsibles.map((responsible) => responsible.responsibleId)
  }

  private async createConsentIfMissing({
    eventId,
    studentId,
    responsibleId,
    expiresAt,
    source,
  }: {
    eventId: string
    studentId: string
    responsibleId: string
    expiresAt: Event['startDate']
    source?: string
  }) {
    return db.transaction(async (trx) => {
      const existing = await EventParentalConsent.query({ client: trx })
        .where('eventId', eventId)
        .where('studentId', studentId)
        .where('responsibleId', responsibleId)
        .first()

      if (existing) {
        return false
      }

      await EventParentalConsent.create(
        {
          eventId,
          studentId,
          responsibleId,
          status: 'PENDING',
          expiresAt,
          reminderCount: 0,
          metadata: {
            source: source ?? 'events.auto-invite',
          },
        },
        { client: trx }
      )

      return true
    })
  }
}
