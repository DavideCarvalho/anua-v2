import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import SchoolChainDto from '#models/dto/school_chain.dto'
import { listSchoolChainsValidator } from '#validators/school_chain'

export default class ListSchoolChainsController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listSchoolChainsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10
    const search = payload.search?.trim()

    const query = SchoolChain.query().orderBy('createdAt', 'desc')

    if (search) {
      query.where((builder) => {
        builder.whereILike('name', `%${search}%`).orWhereILike('slug', `%${search}%`)
      })
    }

    const chains = await query.paginate(page, limit)

    return SchoolChainDto.fromPaginator(chains)
  }
}
