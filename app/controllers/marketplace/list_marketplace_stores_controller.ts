import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import Student from '#models/student'
import User from '#models/user'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ListMarketplaceStoresController {
  async handle({ auth, request, response, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }
    const studentIdOrSlug = request.input('studentId')

    // Resolve school IDs based on role
    let schoolIds: string[] = []

    if (studentIdOrSlug) {
      // Resolve slug to actual student ID
      const resolvedStudentId = await this.resolveStudentId(studentIdOrSlug)
      if (!resolvedStudentId) {
        return response.notFound({ message: 'Aluno não encontrado' })
      }

      // Responsible buying for a specific child
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', resolvedStudentId)
        .first()

      if (!relation) {
        return response.forbidden({ message: 'Você não é responsável por este aluno' })
      }

      schoolIds = await this.getStudentSchoolIds(resolvedStudentId)
    } else {
      // Student buying for themselves
      const student = await Student.find(user.id)
      if (!student) {
        return response.forbidden({ message: 'Usuário não é um aluno' })
      }
      schoolIds = await this.getStudentSchoolIds(user.id)
    }

    if (!schoolIds.length) {
      return response.ok({ data: [] })
    }

    const stores = await Store.query()
      .whereIn('schoolId', schoolIds)
      .whereNull('deletedAt')
      .where('isActive', true)
      .preload('school')
      .orderBy('name', 'asc')

    return response.ok({ data: stores })
  }

  /**
   * Resolves a studentId that may be a UUID or a user slug.
   */
  private async resolveStudentId(studentIdOrSlug: string): Promise<string | null> {
    // Try direct student ID first
    const student = await Student.find(studentIdOrSlug)
    if (student) return student.id

    // Try resolving by user slug
    const userBySlug = await User.query().where('slug', studentIdOrSlug).first()
    if (userBySlug) {
      const studentByUser = await Student.find(userBySlug.id)
      if (studentByUser) return studentByUser.id
    }

    return null
  }

  /**
   * Resolves the set of school IDs a student is enrolled in.
   *
   * Chain: StudentHasLevel -> Level (has direct schoolId) -> School
   * Fallback: Student -> User (has direct schoolId)
   */
  private async getStudentSchoolIds(studentId: string): Promise<string[]> {
    const schoolIds = new Set<string>()

    // Primary path: StudentHasLevel -> Level -> School
    // Level has a direct `schoolId` column — no intermediate Course model.
    const enrollments = await StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .preload('level', (q) => q.preload('school'))

    for (const enrollment of enrollments) {
      if (enrollment.level?.school?.id) {
        schoolIds.add(enrollment.level.school.id)
      } else if (enrollment.level?.schoolId) {
        // Level loaded but school relationship not hydrated — use FK directly
        schoolIds.add(enrollment.level.schoolId)
      }
    }

    // Fallback: check student's User record for a direct schoolId
    const student = await Student.query().where('id', studentId).preload('user').first()

    if (student?.user?.schoolId) {
      schoolIds.add(student.user.schoolId)
    }

    return Array.from(schoolIds)
  }
}
