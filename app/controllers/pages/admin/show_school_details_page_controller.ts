import type { HttpContext } from '@adonisjs/core/http'

export default class ShowSchoolDetailsPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('admin/escolas/detalhes', {
      schoolId: params.id,
    })
  }
}
