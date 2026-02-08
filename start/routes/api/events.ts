import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Events
const ListEventsController = () => import('#controllers/events/list_events_controller')
const ShowEventController = () => import('#controllers/events/show_event_controller')
const CreateEventController = () => import('#controllers/events/create_event_controller')
const UpdateEventController = () => import('#controllers/events/update_event_controller')
const DeleteEventController = () => import('#controllers/events/delete_event_controller')
const PublishEventController = () => import('#controllers/events/publish_event_controller')
const CancelEventController = () => import('#controllers/events/cancel_event_controller')
const CompleteEventController = () => import('#controllers/events/complete_event_controller')

// Event Participants
const ListEventParticipantsController = () =>
  import('#controllers/event_participants/list_event_participants_controller')
const RegisterParticipantController = () =>
  import('#controllers/event_participants/register_participant_controller')
const UpdateParticipantStatusController = () =>
  import('#controllers/event_participants/update_participant_status_controller')
const CancelRegistrationController = () =>
  import('#controllers/event_participants/cancel_registration_controller')
const ConfirmAttendanceController = () =>
  import('#controllers/event_participants/confirm_attendance_controller')

// Parental Consents
const ListPendingConsentsController = () =>
  import('#controllers/parental_consents/list_pending_consents_controller')
const RespondConsentController = () =>
  import('#controllers/parental_consents/respond_consent_controller')
const ListConsentHistoryController = () =>
  import('#controllers/parental_consents/list_consent_history_controller')
const ListEventConsentsController = () =>
  import('#controllers/parental_consents/list_event_consents_controller')
const RequestConsentController = () =>
  import('#controllers/parental_consents/request_consent_controller')

export function registerEventApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListEventsController]).as('events.index')
      router.post('/', [CreateEventController]).as('events.store')
      router.get('/:id', [ShowEventController]).as('events.show')
      router.put('/:id', [UpdateEventController]).as('events.update')
      router.delete('/:id', [DeleteEventController]).as('events.destroy')
      router.post('/:id/publish', [PublishEventController]).as('events.publish')
      router.post('/:id/cancel', [CancelEventController]).as('events.cancel')
      router.post('/:id/complete', [CompleteEventController]).as('events.complete')

      // Participants
      router
        .get('/:eventId/participants', [ListEventParticipantsController])
        .as('events.participants.index')
      router
        .post('/:eventId/participants', [RegisterParticipantController])
        .as('events.participants.register')
      router
        .patch('/:eventId/participants/:participantId', [UpdateParticipantStatusController])
        .as('events.participants.updateStatus')
      router
        .delete('/:eventId/participants/:participantId', [CancelRegistrationController])
        .as('events.participants.cancel')
      router
        .post('/:eventId/participants/:participantId/confirm', [ConfirmAttendanceController])
        .as('events.participants.confirmAttendance')
    })
    .prefix('/events')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerParentalConsentApiRoutes() {
  router
    .group(() => {
      router.get('/pending', [ListPendingConsentsController]).as('consents.pending')
      router.get('/history', [ListConsentHistoryController]).as('consents.history')
      router
        .get('/events/:eventId/consents', [ListEventConsentsController])
        .as('events.consents.index')
      router.post('/request', [RequestConsentController]).as('events.consents.request')
      router.post('/:id/respond', [RespondConsentController]).as('consents.respond')
    })
    .prefix('/parental-consents')
    .use([middleware.auth(), middleware.impersonation()])
}
