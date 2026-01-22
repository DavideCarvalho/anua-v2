import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import TeacherHasClass from '#models/teacher_has_class'
import { v7 as uuidv7 } from 'uuid'
import { updateClassWithTeachersValidator } from '#validators/class'

export default class UpdateClassWithTeachersController {
  async handle({ params, request, response }: HttpContext) {
    const class_ = await Class_.find(params.id)

    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const payload = await request.validateUsing(updateClassWithTeachersValidator)

    const existingAssignments = await TeacherHasClass.query().where('classId', class_.id)

    // Create a map for quick lookup: "teacherId:subjectId" -> record
    const existingMap = new Map<string, TeacherHasClass>()
    for (const assignment of existingAssignments) {
      const key = `${assignment.teacherId}:${assignment.subjectId}`
      existingMap.set(key, assignment)
    }

    // Track which records should remain active
    const activeKeys = new Set<string>()
    const toUpdate: Array<{ id: string; subjectQuantity: number }> = []
    const toCreate: Array<{
      id: string
      classId: string
      teacherId: string
      subjectId: string
      subjectQuantity: number
      isActive: boolean
    }> = []

    for (const item of payload.subjectsWithTeachers) {
      const key = `${item.teacherId}:${item.subjectId}`
      activeKeys.add(key)

      const existing = existingMap.get(key)
      if (existing) {
        toUpdate.push({ id: existing.id, subjectQuantity: item.quantity })
      } else {
        toCreate.push({
          id: uuidv7(),
          classId: class_.id,
          teacherId: item.teacherId,
          subjectId: item.subjectId,
          subjectQuantity: item.quantity,
          isActive: true,
        })
      }
    }

    // IDs to deactivate
    const toDeactivateIds = existingAssignments
      .filter((a) => !activeKeys.has(`${a.teacherId}:${a.subjectId}`))
      .map((a) => a.id)

    // Update class name
    class_.name = payload.name
    await class_.save()

    // Deactivate removed assignments
    if (toDeactivateIds.length > 0) {
      await TeacherHasClass.query().whereIn('id', toDeactivateIds).update({ isActive: false })
    }

    // Reactivate and update existing assignments using raw SQL
    for (const update of toUpdate) {
      await db.rawQuery(
        `UPDATE "TeacherHasClass" SET "isActive" = true, "subjectQuantity" = ? WHERE id = ?`,
        [update.subjectQuantity, update.id]
      )
    }

    // Create new assignments
    for (const create of toCreate) {
      await TeacherHasClass.create(create)
    }

    // Return updated class with teachers
    const updatedClass = await Class_.query()
      .where('id', class_.id)
      .preload('teacherClasses', (query) => {
        query.where('isActive', true)
        query.preload('teacher', (tq) => tq.preload('user'))
        query.preload('subject')
      })
      .firstOrFail()

    return response.ok({
      id: updatedClass.id,
      name: updatedClass.name,
      subjectsWithTeachers: updatedClass.teacherClasses.map((tc) => ({
        id: tc.id,
        teacher: {
          id: tc.teacherId,
          name: tc.teacher?.user?.name ?? 'Professor',
        },
        subject: {
          id: tc.subjectId,
          name: tc.subject?.name ?? 'Matéria',
        },
        quantity: tc.subjectQuantity,
      })),
    })
  }
}
