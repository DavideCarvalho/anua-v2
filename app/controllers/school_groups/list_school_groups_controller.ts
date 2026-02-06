import type { HttpContext } from '@adonisjs/core/http'
import SchoolGroup from '#models/school_group'
import SchoolGroupDto from '#models/dto/school_group.dto'
import { listSchoolGroupsValidator } from '#validators/school_group'

export default class ListSchoolGroupsController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listSchoolGroupsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = SchoolGroup.query().preload('schoolChain').orderBy('createdAt', 'desc')

    if (payload.schoolChainId) {
      query.where('schoolChainId', payload.schoolChainId)
    }

    if (payload.type) {
      query.where('type', payload.type)
    }

    const groups = await query.paginate(page, limit)

    return SchoolGroupDto.fromPaginator(groups)
  }
}
