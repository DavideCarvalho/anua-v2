import type { HttpContext } from '@adonisjs/core/http'
import Class from '#models/class'
import Subject from '#models/subject'

export default class ShowAtividadesPageController {
  async handle({ inertia, params }: HttpContext) {
    const { schoolSlug } = params

    const classes = await Class.query()
      .whereHas('level', (query) => {
        query.where('schoolId', schoolSlug)
      })
      .select('id', 'name')
      .orderBy('name')

    const subjects = await Subject.query()
      .where('schoolId', schoolSlug)
      .select('id', 'name')
      .orderBy('name')

    return inertia.render('escola/pedagogico/atividades', {
      schoolId: schoolSlug,
      classes: classes.map((c) => ({ id: c.id, name: c.name })),
      subjects: subjects.map((s) => ({ id: s.id, name: s.name })),
    })
  }
}
