import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'

export default class ShowSchoolController {
  async handle({ params, response }: HttpContext) {
    const school = await School.query()
      .where('id', params.id)
      .preload('schoolChain')
      .preload('schoolGroups')
      .first()

    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    // Buscar o diretor da escola (usuário com role SCHOOL_DIRECTOR vinculado via UserHasSchool)
    const directorRelation = await UserHasSchool.query()
      .where('schoolId', school.id)
      .preload('user', (userQuery) => {
        userQuery.preload('role')
      })
      .whereHas('user', (userQuery) => {
        userQuery.whereHas('role', (roleQuery) => {
          roleQuery.where('name', 'SCHOOL_DIRECTOR')
        })
      })
      .first()

    const director = directorRelation?.user
      ? {
          id: directorRelation.user.id,
          name: directorRelation.user.name,
          email: directorRelation.user.email,
          phone: directorRelation.user.phone,
        }
      : null

    return response.ok({
      ...school.serialize(),
      director,
    })
  }
}
