import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import { updateEventValidator } from '#validators/event'
import { DateTime } from 'luxon'

export default class UpdateEventController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updateEventValidator)

    const event = await Event.find(id)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    // Don't allow updates to published/completed events (except cancellation)
    if (event.status === 'COMPLETED') {
      return response.badRequest({ message: 'Cannot update a completed event' })
    }

    // Update fields directly
    if (data.title !== undefined) event.title = data.title
    if (data.description !== undefined) event.description = data.description
    if (data.location !== undefined) event.location = data.location
    if (data.type !== undefined) event.type = data.type
    if (data.maxParticipants !== undefined) event.maxParticipants = data.maxParticipants
    if (data.additionalCostAmount !== undefined) event.additionalCostAmount = data.additionalCostAmount
    if (data.additionalCostDescription !== undefined) event.additionalCostDescription = data.additionalCostDescription
    if (data.visibility !== undefined) event.visibility = data.visibility
    if (data.requiresParentalConsent !== undefined) event.requiresParentalConsent = data.requiresParentalConsent
    if (data.hasAdditionalCosts !== undefined) event.hasAdditionalCosts = data.hasAdditionalCosts
    if (data.startsAt !== undefined) event.startsAt = DateTime.fromJSDate(data.startsAt)
    if (data.endsAt !== undefined) {
      event.endsAt = data.endsAt ? DateTime.fromJSDate(data.endsAt) : null
    }

    await event.save()

    await event.load('organizer')
    await event.load('school')

    return response.ok(event)
  }
}
