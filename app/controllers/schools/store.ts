import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'
import SchoolDto from '#models/dto/school.dto'
import { createSchoolValidator } from '#validators/school'
import AppException from '#exceptions/app_exception'

export default class StoreSchoolController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createSchoolValidator)

    // Verifica se slug já existe
    const existingSchool = await School.findBy('slug', data.slug)
    if (existingSchool) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    // Usa transaction para garantir atomicidade
    const school = await db.transaction(async (trx) => {
      // Cria escola explicitando campos permitidos (evita mass assignment)
      const newSchool = await School.create(
        {
          name: data.name,
          slug: data.slug,
          street: data.street ?? null,
          number: data.number ?? null,
          complement: data.complement ?? null,
          neighborhood: data.neighborhood ?? null,
          city: data.city ?? null,
          state: data.state ?? null,
          zipCode: data.zipCode ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          logoUrl: data.logoUrl ?? null,
          schoolChainId: data.schoolChainId ?? null,
          minimumGrade: data.minimumGrade ?? undefined,
          calculationAlgorithm: data.calculationAlgorithm ?? 'AVERAGE',
          minimumAttendancePercentage: data.minimumAttendancePercentage ?? undefined,
        },
        { client: trx }
      )

      return newSchool
    })

    return response.created(new SchoolDto(school))
  }
}
