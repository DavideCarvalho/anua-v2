import type { HttpContext } from '@adonisjs/core/http'
import { assignResponsibleValidator } from '#validators/responsible'
import StudentHasResponsible from '#models/student_has_responsible'
import User from '#models/user'
import Student from '#models/student'
import { StudentHasResponsibleDto } from '#models/dto/student_has_responsible.dto'
import AppException from '#exceptions/app_exception'

export default class AssignResponsibleController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(assignResponsibleValidator)

    // Verificar se o estudante existe
    await Student.findOrFail(payload.studentId)

    // Verificar se o usuário existe e pode ser responsável
    await User.findOrFail(payload.responsibleId)

    // Verificar se já existe a relação
    const existingAssignment = await StudentHasResponsible.query()
      .where('studentId', payload.studentId)
      .where('responsibleId', payload.responsibleId)
      .first()

    if (existingAssignment) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const assignment = await StudentHasResponsible.create({
      studentId: payload.studentId,
      responsibleId: payload.responsibleId,
      isPedagogical: payload.isPedagogical || false,
      isFinancial: payload.isFinancial || false,
    })

    await assignment.load('responsible', (query) => {
      query.preload('role')
    })
    await assignment.load('student', (query) => {
      query.preload('user')
    })

    return new StudentHasResponsibleDto(assignment)
  }
}
