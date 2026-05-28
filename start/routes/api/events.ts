import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerEventApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.events.ListEvents]).as('events.index')
      router.post('/', [controllers.events.CreateEvent]).as('events.store')
      router.get('/:id', [controllers.events.ShowEvent]).as('events.show')
      router.put('/:id', [controllers.events.UpdateEvent]).as('events.update')
      router.delete('/:id', [controllers.events.DeleteEvent]).as('events.destroy')
      router.post('/:id/publish', [controllers.events.PublishEvent]).as('events.publish')
      router.post('/:id/cancel', [controllers.events.CancelEvent]).as('events.cancel')
      router.post('/:id/complete', [controllers.events.CompleteEvent]).as('events.complete')

      // Participants
      router
        .get('/:eventId/participants', [controllers.eventParticipants.ListEventParticipants])
        .as('events.participants.index')
      router
        .post('/:eventId/participants', [controllers.eventParticipants.RegisterParticipant])
        .as('events.participants.register')
      router
        .patch('/:eventId/participants/:participantId', [
          controllers.eventParticipants.UpdateParticipantStatus,
        ])
        .as('events.participants.update_status')
      router
        .delete('/:eventId/participants/:participantId', [
          controllers.eventParticipants.CancelRegistration,
        ])
        .as('events.participants.cancel')
      router
        .post('/:eventId/participants/:participantId/confirm', [
          controllers.eventParticipants.ConfirmAttendance,
        ])
        .as('events.participants.confirm_attendance')

      // Signature template (PDF + posições)
      router
        .get('/:eventId/signature-template', [controllers.events.GetEventSignatureTemplate])
        .as('events.get_signature_template')
      router
        .post('/:eventId/signature-template', [controllers.events.UploadEventSignatureTemplate])
        .as('events.upload_signature_template')
      router
        .delete('/:eventId/signature-template', [controllers.events.DeleteEventSignatureTemplate])
        .as('events.delete_signature_template')
    })
    .prefix('/events')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerParentalConsentApiRoutes() {
  router
    .group(() => {
      router
        .get('/pending', [controllers.parentalConsents.ListPendingConsents])
        .as('consents.pending')
      router
        .get('/history', [controllers.parentalConsents.ListConsentHistory])
        .as('consents.history')
      router
        .get('/events/:eventId/consents', [controllers.parentalConsents.ListEventConsents])
        .as('events.consents.index')
      router
        .post('/request', [controllers.parentalConsents.RequestConsent])
        .as('events.consents.request')
      router
        .post('/:id/respond', [controllers.parentalConsents.RespondConsent])
        .as('consents.respond')
    })
    .prefix('/parental-consents')
    .use([middleware.auth(), middleware.impersonation()])
}
