import type { HttpContext } from '@adonisjs/core/http'
import { v7 as uuidv7 } from 'uuid'
import Class_ from '#models/class'
import TeacherHasClass from '#models/teacher_has_class'
import { createClassWithTeachersValidator } from '#validators/class'

export default class CreateClassWithTeachersController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createClassWithTeachersValidator)

    // Create the class
    const classId = uuidv7()

    const classEntity = await Class_.create({
      id: classId,
      name: payload.name,
      schoolId: payload.schoolId,
      isArchived: false,
    })

    // Create teacher-class assignments
    for (const item of payload.subjectsWithTeachers) {
      await TeacherHasClass.create({
        id: uuidv7(),
        classId: classEntity.id,
        teacherId: item.teacherId,
        subjectId: item.subjectId,
        subjectQuantity: item.quantity,
        isActive: true,
      })
    }

    // Return the created class with teachers
    const createdClass = await Class_.query()
      .where('id', classEntity.id)
      .preload('teacherClasses', (query) => {
        query.where('isActive', true)
        query.preload('teacher', (tq) => tq.preload('user'))
        query.preload('subject')
      })
      .firstOrFail()

    return response.created({
      id: createdClass.id,
      name: createdClass.name,
      slug: createdClass.slug,
      subjectsWithTeachers: createdClass.teacherClasses.map((tc) => ({
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
