import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import Teacher from '#models/teacher'
import User from '#models/user'
import Role from '#models/role'
import TeacherHasSubject from '#models/teacher_has_subject'
import { createTeacherValidator } from '#validators/teacher'

class ConflictError extends Error {
  status = 409
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

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
      throw new ConflictError('Já existe um usuário com este email')
    }

    // Get teacher role
    const teacherRole = await Role.findBy('name', 'TEACHER')
    if (!teacherRole) {
      throw new InternalError('Role de professor não encontrada')
    }

    // Generate random password
    const randomPassword = string.random(12)
    const slug = string.slug(data.name, { lower: true })

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: randomPassword,
      schoolId: data.schoolId,
      roleId: teacherRole.id,
      slug,
      active: true,
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

    return {
      ...teacher.toJSON(),
      generatedPassword: randomPassword,
    }
  }
}
