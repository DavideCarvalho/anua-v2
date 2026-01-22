import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import Student from '#models/student'
import StudentDto from '#models/dto/student.dto'

export default class ListClassStudentsController {
  async handle({ params, request, response }: HttpContext) {
    const class_ = await Class_.find(params.id)

    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const students = await Student.query()
      .where('classId', params.id)
      .preload('user')
      .paginate(page, limit)

    return response.ok({
      data: StudentDto.fromArray(students.all()),
      meta: students.getMeta(),
    })
  }
}
