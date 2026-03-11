import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'

export default class ShowPedagogicoCalendarioPageController {
  async handle({ inertia, selectedSchoolIds }: HttpContext) {
    const schoolId = selectedSchoolIds?.[0]

    if (!schoolId) {
      return (inertia as any).render('escola/pedagogico/calendario', {
        schoolId: '',
        classes: [],
      })
    }

    const classes = await Class_.query()
      .where('schoolId', schoolId)
      .select('id', 'name')
      .orderBy('name')

    return (inertia as any).render('escola/pedagogico/calendario', {
      schoolId,
      classes: classes.map((c) => ({ id: c.id, name: c.name })),
    })
  }
}
