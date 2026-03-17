import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import { DateTime } from 'luxon'
import ParentalConsentTransformer from '#transformers/parental_consent_transformer'

export default class ListPendingConsentsController {
  async handle({ auth, response, serialize }: HttpContext) {
    const user = auth.user!

    const consents = await EventParentalConsent.query()
      .where('responsibleId', user.id)
      .where('status', 'PENDING')
      .where((query) => {
        query.whereNull('expiresAt').orWhere('expiresAt', '>=', DateTime.now().toSQL())
      })
      .preload('event', (eventQuery) => {
        eventQuery.preload('school')
      })
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('expiresAt', 'asc')

    return response.ok(await serialize(ParentalConsentTransformer.transform(consents)))
  }
}
