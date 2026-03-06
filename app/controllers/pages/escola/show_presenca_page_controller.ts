import type { HttpContext } from '@adonisjs/core/http'
import Class from '#models/class'
import Student from '#models/student'

export default class ShowPresencaPageController {
  async handle({ inertia, selectedSchoolIds }: HttpContext) {
    const schoolId = selectedSchoolIds?.[0]
    if (!schoolId) {
      return inertia.render('escola/pedagogico/presenca', {
        schoolId: '',
        classes: [],
        students: [],
      })
    }

    const classes = await Class.query()
      .whereHas('level', (query) => {
        query.where('schoolId', schoolId)
      })
      .select('id', 'name')
      .orderBy('name')

    const students = await Student.query()
      .whereHas('class', (query) => {
        query.whereHas('level', (q) => {
          q.where('schoolId', schoolId)
        })
      })
      .where('enrollmentStatus', 'REGISTERED')
      .preload('user')
      .select('id', 'classId')

    return inertia.render('escola/pedagogico/presenca', {
      schoolId,
      classes: classes.map((c) => ({ id: c.id, name: c.name })),
      students: students.map((s) => ({
        id: s.id,
        name: s.user?.name || 'Aluno',
        classId: s.classId,
      })),
    })
  }
}
