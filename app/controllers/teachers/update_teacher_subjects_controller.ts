import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Teacher from '#models/teacher'
import TeacherHasSubject from '#models/teacher_has_subject'
import { v7 as uuidv7 } from 'uuid'
import { updateTeacherSubjectsValidator } from '#validators/teacher'

export default class UpdateTeacherSubjectsController {
  async handle({ params, request, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    const payload = await request.validateUsing(updateTeacherSubjectsValidator)

    await db.transaction(async (trx) => {
      // Remove all existing subject assignments
      await TeacherHasSubject.query().where('teacherId', teacher.id).useTransaction(trx).delete()

      // Create new assignments
      for (const subjectId of payload.subjectIds) {
        const assignment = new TeacherHasSubject()
        assignment.useTransaction(trx)
        assignment.id = uuidv7()
        assignment.teacherId = teacher.id
        assignment.subjectId = subjectId
        await assignment.save()
      }
    })

    // Return updated teacher with subjects
    await teacher.load('subjects')

    return response.ok({
      id: teacher.id,
      subjects: teacher.subjects.map((s) => ({
        id: s.id,
        name: s.name,
      })),
    })
  }
}
