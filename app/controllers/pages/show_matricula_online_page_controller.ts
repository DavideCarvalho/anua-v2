import type { HttpContext } from '@adonisjs/core/http'

export default class ShowMatriculaOnlinePageController {
  async handle({ params, inertia }: HttpContext) {
    const { schoolSlug, academicPeriodSlug, courseSlug } = params

    return inertia.render('matricula-online/index', {
      schoolSlug,
      academicPeriodSlug,
      courseSlug,
    })
  }
}
