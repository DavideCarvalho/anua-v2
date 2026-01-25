import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import Student from '#models/student'

export default class CountClassStudentsController {
  async handle({ params, response }: HttpContext) {
    const classEntity = await Class_.find(params.id)

    if (!classEntity) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const count = await Student.query().where('classId', params.id).count('* as total')

    return response.ok({ count: Number(count[0].$extras.total) })
  }
}
