import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCursoTurmasPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/index', {
      academicPeriodSlug: params.slug,
      courseSlug: params.cursoSlug,
    })
  }
}
