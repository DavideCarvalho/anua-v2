import type { HttpContext } from '@adonisjs/core/http'
import PrintRequest from '#models/print_request'
import PrintRequestDto from '#models/dto/print_request.dto'
import { listPrintRequestsValidator } from '#validators/print_request'

export default class ListPrintRequestsController {
  async handle({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(listPrintRequestsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const schoolId = auth.user?.schoolId

    const query = PrintRequest.query()
      .preload('user')
      .orderBy('createdAt', 'desc')
      .whereHas('user', (userQuery) => {
        if (schoolId) {
          userQuery.where('schoolId', schoolId)
        }
      })

    if (payload.statuses?.length) {
      query.whereIn('status', payload.statuses)
    }

    const results = await query.paginate(page, limit)

    return PrintRequestDto.fromPaginator(results)
  }
}
