import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreTransformer from '#transformers/store_transformer'
import Student from '#models/student'
import User from '#models/user'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

export default class ListMarketplaceStoresController {
  async handle({ auth, request, response, effectiveUser, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }
    const studentIdOrSlug = request.input('studentId')

    // Resolve school IDs based on role
    let schoolIds: string[] = []

    if (studentIdOrSlug) {
      // Resolve slug to actual student ID
      const resolvedStudentId = await this.resolveStudentId(studentIdOrSlug)
      if (!resolvedStudentId) {
        throw AppException.notFound('Aluno não encontrado')
      }

      // Responsible buying for a specific child
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', resolvedStudentId)
        .first()

      if (!relation) {
        throw AppException.forbidden('Você não é responsável por este aluno')
      }

      schoolIds = await this.getStudentSchoolIds(resolvedStudentId)
    } else {
      // Student buying for themselves
      const student = await Student.find(user.id)
      if (!student) {
        throw AppException.forbidden('Usuário não é um aluno')
      }
      schoolIds = await this.getStudentSchoolIds(user.id)
    }

    if (!schoolIds.length) {
      return response.ok([])
    }

    const stores = await Store.query()
      .whereIn('schoolId', schoolIds)
      .whereNull('deletedAt')
      .where('isActive', true)
      .preload('school')
      .orderBy('name', 'asc')

    return response.ok(await serialize(StoreTransformer.transform(stores)))
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
   * Chain: StudentHasLevel -> Level (school), levelAssignedToCourseAcademicPeriod -> Level (school),
   *        StudentHasLevel -> Class (school)
   * Fallback: Student.class -> School, Student -> User.schoolId
   */
  private async getStudentSchoolIds(studentId: string): Promise<string[]> {
    const schoolIds = new Set<string>()

    const enrollments = await StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .preload('level', (q) => q.preload('school'))
      .preload('class', (q) => q.preload('school'))
      .preload('levelAssignedToCourseAcademicPeriod', (q) =>
        q.preload('level', (lq) => lq.preload('school'))
      )

    for (const enrollment of enrollments) {
      if (enrollment.level?.school?.id) {
        schoolIds.add(enrollment.level.school.id)
      } else if (enrollment.level?.schoolId) {
        schoolIds.add(enrollment.level.schoolId)
      }

      const lacap = enrollment.levelAssignedToCourseAcademicPeriod
      if (lacap?.level?.school?.id) {
        schoolIds.add(lacap.level.school.id)
      } else if (lacap?.level?.schoolId) {
        schoolIds.add(lacap.level.schoolId)
      }

      if (enrollment.class?.school?.id) {
        schoolIds.add(enrollment.class.school.id)
      } else if (enrollment.class?.schoolId) {
        schoolIds.add(enrollment.class.schoolId)
      }
    }

    const student = await Student.query()
      .where('id', studentId)
      .preload('user')
      .preload('class')
      .first()

    if (student?.user?.schoolId) {
      schoolIds.add(student.user.schoolId)
    }
    if (student?.class?.schoolId) {
      schoolIds.add(student.class.schoolId)
    }

    return Array.from(schoolIds)
  }
}
