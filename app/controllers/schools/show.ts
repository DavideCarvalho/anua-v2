import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'
import AppException from '#exceptions/app_exception'

export default class ShowSchoolController {
  async handle({ params, response }: HttpContext) {
    const school = await School.query()
      .where('id', params.id)
      .preload('schoolChain')
      .preload('schoolGroups')
      .preload('users', (query) => {
        query.preload('role')
      })
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
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

    const users = school.users.map((user) => {
      const role = user.$preloaded.role
      const roleName =
        typeof role === 'object' && role !== null && !Array.isArray(role)
          ? Reflect.get(role, 'name')
          : null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: typeof roleName === 'string' ? roleName : null,
        roleName: typeof roleName === 'string' ? roleName : null,
      }
    })

    return response.ok({
      id: school.id,
      name: school.name,
      slug: school.slug,
      logoUrl: school.logoUrl,
      zipCode: school.zipCode,
      street: school.street,
      number: school.number,
      complement: school.complement,
      neighborhood: school.neighborhood,
      city: school.city,
      state: school.state,
      latitude: school.latitude,
      longitude: school.longitude,
      minimumGrade: school.minimumGrade,
      minimumAttendancePercentage: school.minimumAttendancePercentage,
      calculationAlgorithm: school.calculationAlgorithm,
      hasInsurance: school.hasInsurance,
      insurancePercentage: school.insurancePercentage,
      insuranceCoveragePercentage: school.insuranceCoveragePercentage,
      insuranceClaimWaitingDays: school.insuranceClaimWaitingDays,
      schoolChain: school.schoolChain
        ? {
            id: school.schoolChain.id,
            name: school.schoolChain.name,
          }
        : null,
      users,
      director,
      createdAt: school.createdAt.toISO(),
      updatedAt: school.updatedAt?.toISO() ?? null,
    })
  }
}
