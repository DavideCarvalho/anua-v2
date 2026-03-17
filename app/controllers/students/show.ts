import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import StudentTransformer from '#transformers/student_transformer'
import AppException from '#exceptions/app_exception'

export default class ShowStudentController {
  async handle({ params, response, serialize }: HttpContext) {
    const student = await Student.query()
      .where('id', params.id)
      .preload('user', (userQuery) => {
        userQuery.whereNull('deletedAt').preload('role').preload('school')
      })
      .preload('class')
      .preload('address')
      .preload('medicalInfo', (medQuery) => {
        medQuery.preload('medications')
      })
      .preload('emergencyContacts')
      .preload('responsibles', (respQuery) => {
        respQuery.preload('responsible')
      })
      .preload('documents', (docsQuery) => {
        docsQuery.preload('contractDocument')
      })
      .preload('levels', (levelsQuery) => {
        levelsQuery
          .whereNull('deletedAt')
          .preload('class')
          .preload('levelAssignedToCourseAcademicPeriod', (lacapQuery) => {
            lacapQuery.preload('courseHasAcademicPeriod', (chapQuery) => {
              chapQuery.preload('academicPeriod').preload('course')
            })
          })
      })
      .first()

    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    return response.ok(await serialize(StudentTransformer.transform(student)))
  }
}
