import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ListMarketplaceStoresController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const studentId = request.input('studentId')

    // Resolve school IDs based on role
    let schoolIds: string[] = []

    if (studentId) {
      // Responsible buying for a specific child
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', studentId)
        .first()

      if (!relation) {
        return response.forbidden({ message: 'Você não é responsável por este aluno' })
      }

      schoolIds = await this.getStudentSchoolIds(studentId)
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
    const student = await Student.query()
      .where('id', studentId)
      .preload('user')
      .first()

    if (student?.user?.schoolId) {
      schoolIds.add(student.user.schoolId)
    }

    return Array.from(schoolIds)
  }
}
