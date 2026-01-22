import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditSchoolPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('admin/escolas/editar', {
      schoolId: params.id,
    })
  }
}
