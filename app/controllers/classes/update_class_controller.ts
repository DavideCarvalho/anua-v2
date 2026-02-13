import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import TeacherHasClass from '#models/teacher_has_class'
import Calendar from '#models/calendar'
import ClassDto from '#models/dto/class.dto'
import { updateClassValidator } from '#validators/class'
import AppException from '#exceptions/app_exception'
import { v7 as uuidv7 } from 'uuid'

export default class UpdateClassController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const classEntity = await Class_.query()
      .where('id', params.id)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .first()

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    const data = await request.validateUsing(updateClassValidator)

    // Usa transaction e extrai campos explicitamente (evita mass assignment)
    const updatedClass = await db.transaction(async (trx) => {
      const classUpdates: Partial<{ name: string; isArchived: boolean }> = {}
      if (data.name !== undefined) classUpdates.name = data.name
      if (data.status !== undefined) classUpdates.isArchived = data.status === 'ARCHIVED'

      classEntity.merge(classUpdates)

      await classEntity.useTransaction(trx).save()

      if (data.subjectsWithTeachers) {
        const existingAssignments = await TeacherHasClass.query({ client: trx }).where(
          'classId',
          classEntity.id
        )
        let shouldInvalidateSchedule = false

        const existingMap = new Map<string, TeacherHasClass>()
        for (const assignment of existingAssignments) {
          const key = `${assignment.teacherId}:${assignment.subjectId}`
          existingMap.set(key, assignment)
        }

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

        for (const item of data.subjectsWithTeachers) {
          const key = `${item.teacherId}:${item.subjectId}`
          activeKeys.add(key)

          const existing = existingMap.get(key)
          if (existing) {
            if (existing.subjectQuantity !== item.quantity || !existing.isActive) {
              shouldInvalidateSchedule = true
            }
            toUpdate.push({ id: existing.id, subjectQuantity: item.quantity })
          } else {
            shouldInvalidateSchedule = true
            toCreate.push({
              id: uuidv7(),
              classId: classEntity.id,
              teacherId: item.teacherId,
              subjectId: item.subjectId,
              subjectQuantity: item.quantity,
              isActive: true,
            })
          }
        }

        const toDeactivateIds = existingAssignments
          .filter(
            (assignment) => !activeKeys.has(`${assignment.teacherId}:${assignment.subjectId}`)
          )
          .map((assignment) => assignment.id)

        if (
          existingAssignments.some(
            (assignment) =>
              assignment.isActive &&
              !activeKeys.has(`${assignment.teacherId}:${assignment.subjectId}`)
          )
        ) {
          shouldInvalidateSchedule = true
        }

        if (toDeactivateIds.length > 0) {
          await TeacherHasClass.query({ client: trx })
            .whereIn('id', toDeactivateIds)
            .update({ isActive: false })
        }

        for (const update of toUpdate) {
          await TeacherHasClass.query({ client: trx }).where('id', update.id).update({
            isActive: true,
            subjectQuantity: update.subjectQuantity,
          })
        }

        for (const create of toCreate) {
          const assignment = new TeacherHasClass()
          assignment.useTransaction(trx)
          assignment.fill(create)
          await assignment.save()
        }

        if (shouldInvalidateSchedule) {
          await Calendar.query({ client: trx })
            .where('classId', classEntity.id)
            .where('isActive', true)
            .update({ isActive: false })
        }
      }

      return classEntity
    })

    return response.ok(new ClassDto(updatedClass))
  }
}
