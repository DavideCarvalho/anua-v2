import type { HttpContext } from '@adonisjs/core/http'

export default class ShowGradePageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/grade')
  }
}
