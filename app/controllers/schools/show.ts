import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'
import AppException from '#exceptions/app_exception'

function formatRoleName(role: string | undefined): string {
  const roleMap: Record<string, string> = {
    SCHOOL_DIRECTOR: 'Diretor(a)',
    SCHOOL_COORDINATOR: 'Coordenador(a)',
    SCHOOL_ADMIN: 'Administrador',
    SCHOOL_ADMINISTRATIVE: 'Administrativo',
    SCHOOL_TEACHER: 'Professor(a)',
    SCHOOL_CANTEEN: 'Cantina',
  }

  return roleMap[role || ''] || role || 'Sem cargo'
}

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
        ? { id: school.schoolChain.id, name: school.schoolChain.name }
        : null,
      users:
        school.users?.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name ?? null,
          roleName: formatRoleName(user.role?.name),
        })) ?? [],
      director: director
        ? {
            id: director.id,
            name: director.name,
            email: director.email,
          }
        : null,
      createdAt: school.createdAt.toISO(),
      updatedAt: school.updatedAt?.toISO() ?? null,
    })
  }
}
