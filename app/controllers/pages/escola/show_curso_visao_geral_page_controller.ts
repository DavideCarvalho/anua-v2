import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCursoVisaoGeralPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/periodos-letivos/[slug]/cursos/[cursoSlug]/visao-geral', {
      academicPeriodSlug: params.slug,
      courseSlug: params.cursoSlug,
    })
  }
}
