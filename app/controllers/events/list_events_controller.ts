import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import { listEventsValidator } from '#validators/event'
import { DateTime } from 'luxon'
import EventDto from '#models/dto/event.dto'

export default class ListEventsController {
  async handle(ctx: HttpContext) {
    const { request, response, selectedSchoolIds } = ctx
    const {
      schoolId,
      type,
      status,
      visibility,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listEventsValidator)

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Event.query()
      .preload('organizer')
      .preload('school')
      .preload('eventAudiences')
      .withCount('participants')

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('Event.schoolId', schoolIds)
    }

    if (type) {
      query.where('type', type)
    }

    if (status) {
      query.where('status', status)
    }

    if (visibility) {
      query.where('visibility', visibility)
    }

    if (startDate) {
      const parsedStartDate = DateTime.fromISO(startDate)
      if (parsedStartDate.isValid) {
        query.where('Event.startDate', '>=', parsedStartDate.toSQL())
      }
    }

    if (endDate) {
      const parsedEndDate = DateTime.fromISO(endDate)
      if (parsedEndDate.isValid) {
        query.where('Event.startDate', '<=', parsedEndDate.toSQL())
      }
    }

    const events = await query.orderBy('Event.startDate', 'desc').paginate(page, limit)

    return response.ok(EventDto.fromPaginator(events))
  }
}
