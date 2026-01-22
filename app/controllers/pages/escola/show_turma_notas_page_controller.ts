import type { HttpContext } from '@adonisjs/core/http'

export default class ShowTurmaNotasPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render(
      'escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/notas',
      {
        academicPeriodSlug: params.slug,
        courseSlug: params.cursoSlug,
        classSlug: params.turmaSlug,
      }
    )
  }
}
