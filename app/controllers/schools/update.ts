import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'
import SchoolDto from '#models/dto/school.dto'
import { updateSchoolValidator } from '#validators/school'
import AppException from '#exceptions/app_exception'

export default class UpdateSchoolController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const school = await School.query()
      .where('id', params.id)
      .whereIn('id', selectedSchoolIds ?? [])
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const data = await request.validateUsing(updateSchoolValidator)

    if (data.slug && data.slug !== school.slug) {
      const existingSchool = await School.findBy('slug', data.slug)
      if (existingSchool) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    // Usa transaction e extrai campos explicitamente (evita mass assignment)
    const updatedSchool = await db.transaction(async (trx) => {
      school.merge({
        name: data.name ?? school.name,
        slug: data.slug ?? school.slug,
        street: data.street !== undefined ? data.street : school.street,
        number: data.number !== undefined ? data.number : school.number,
        complement: data.complement !== undefined ? data.complement : school.complement,
        neighborhood: data.neighborhood !== undefined ? data.neighborhood : school.neighborhood,
        city: data.city !== undefined ? data.city : school.city,
        state: data.state !== undefined ? data.state : school.state,
        zipCode: data.zipCode !== undefined ? data.zipCode : school.zipCode,
        latitude: data.latitude !== undefined ? data.latitude : school.latitude,
        longitude: data.longitude !== undefined ? data.longitude : school.longitude,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : school.logoUrl,
        schoolChainId: data.schoolChainId !== undefined ? data.schoolChainId : school.schoolChainId,
        minimumGrade: data.minimumGrade !== undefined ? data.minimumGrade : school.minimumGrade,
        calculationAlgorithm: data.calculationAlgorithm ?? school.calculationAlgorithm,
        minimumAttendancePercentage:
          data.minimumAttendancePercentage !== undefined
            ? data.minimumAttendancePercentage
            : school.minimumAttendancePercentage,
      })

      await school.useTransaction(trx).save()
      return school
    })

    return response.ok(new SchoolDto(updatedSchool))
  }
}
