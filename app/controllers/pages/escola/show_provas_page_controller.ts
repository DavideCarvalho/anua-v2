import type { HttpContext } from '@adonisjs/core/http'
import Class from '#models/class'
import Subject from '#models/subject'

export default class ShowProvasPageController {
  async handle({ inertia, selectedSchoolIds }: HttpContext) {
    const schoolId = selectedSchoolIds?.[0]
    if (!schoolId) {
      return inertia.render('escola/pedagogico/provas', {
        schoolId: '',
        classes: [],
        subjects: [],
      })
    }

    const classes = await Class.query()
      .whereHas('level', (query) => {
        query.where('schoolId', schoolId)
      })
      .select('id', 'name')
      .orderBy('name')

    const subjects = await Subject.query()
      .where('schoolId', schoolId)
      .select('id', 'name')
      .orderBy('name')

    return inertia.render('escola/pedagogico/provas', {
      schoolId,
      classes: classes.map((c) => ({ id: c.id, name: c.name })),
      subjects: subjects.map((s) => ({ id: s.id, name: s.name })),
    })
  }
}
