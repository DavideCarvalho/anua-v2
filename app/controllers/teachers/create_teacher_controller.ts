import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import Teacher from '#models/teacher'
import User from '#models/user'
import Role from '#models/role'
import TeacherHasSubject from '#models/teacher_has_subject'
import UserHasSchool from '#models/user_has_school'
import { createTeacherValidator } from '#validators/teacher'
import TeacherDto from '#models/dto/teacher.dto'
import AppException from '#exceptions/app_exception'

class InternalError extends Error {
  status = 500
  constructor(message: string) {
    super(message)
    this.name = 'InternalError'
  }
}

export default class CreateTeacherController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(createTeacherValidator)

    // Check if user already exists
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    // Get teacher role
    const teacherRole = await Role.findBy('name', 'SCHOOL_TEACHER')
    if (!teacherRole) {
      throw new InternalError('Role de professor não encontrada')
    }

    const slug = string.slug(data.name, { lower: true })

    // Create user (auth is done via email code, no password needed)
    const user = await User.create({
      name: data.name,
      email: data.email,
      schoolId: data.schoolId,
      roleId: teacherRole.id,
      slug,
      active: true,
    })

    // Link user to school (required for list queries)
    await UserHasSchool.create({
      userId: user.id,
      schoolId: data.schoolId,
      isDefault: true,
    })

    // Create teacher
    const teacher = await Teacher.create({
      id: user.id,
      hourlyRate: data.hourlyRate ?? 0,
    })

    // Assign subjects if provided
    if (data.subjectIds && data.subjectIds.length > 0) {
      for (const subjectId of data.subjectIds) {
        await TeacherHasSubject.create({
          teacherId: teacher.id,
          subjectId,
        })
      }
    }

    await teacher.load('user')
    await teacher.load('subjects')

    return new TeacherDto(teacher)
  }
}
