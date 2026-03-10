import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type CourseHasAcademicPeriod from '#models/course_has_academic_period'
import type LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import type User from '#models/user'
import Course from '#models/course'
import TeacherHasClass from '#models/teacher_has_class'
import UserHasSchool from '#models/user_has_school'
import Class_ from '#models/class'
import CoordinatorHasLevel from '#models/coordinator_has_level'
import AppException from '#exceptions/app_exception'

/**
 * Middleware to check if user can access attendance endpoints
 *
 * Authorization rules:
 * - SUPER_ADMIN, ADMIN: Full access
 * - SCHOOL_DIRECTOR, SCHOOL_COORDINATOR, SCHOOL_ADMINISTRATIVE: Access to their school
 * - SCHOOL_TEACHER: Only for subjects they teach (TeacherHasClass.isActive = true)
 * - STUDENT_RESPONSIBLE: No access to these endpoints (use /responsavel/* endpoints)
 * - STUDENT: No access
 */
export default class CanAccessAttendanceMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request } = ctx
    const user = ctx.effectiveUser ?? auth.user

    if (!user) {
      throw AppException.badRequest('Não autenticado')
    }

    // Load role if not already loaded
    if (user.roleId && !user.$preloaded.role) {
      await user.load('role')
    }

    const roleName = user.role?.name

    // SUPER_ADMIN and ADMIN: Full access
    if (['SUPER_ADMIN', 'ADMIN'].includes(roleName || '')) {
      return next()
    }

    // SCHOOL_DIRECTOR and SCHOOL_ADMINISTRATIVE: Access to their school
    if (['SCHOOL_DIRECTOR', 'SCHOOL_ADMINISTRATIVE'].includes(roleName || '')) {
      // Check if user belongs to the school
      const hasSchoolAccess = await this.checkSchoolAccess(user, request)
      if (!hasSchoolAccess) {
        throw AppException.forbidden('Você não tem acesso a esta escola')
      }
      return next()
    }

    // SCHOOL_COORDINATOR: Access to coordinated levels/subjects
    if (roleName === 'SCHOOL_COORDINATOR') {
      const hasAccess = await this.checkCoordinatorAccess(user, request)
      if (!hasAccess) {
        throw AppException.forbidden('Você não coordena esta turma/matéria')
      }
      return next()
    }

    // SCHOOL_TEACHER: Only for subjects they teach
    if (roleName === 'SCHOOL_TEACHER') {
      const hasAccess = await this.checkTeacherAccess(user, request)
      if (!hasAccess) {
        throw AppException.forbidden('Você não leciona esta matéria')
      }
      return next()
    }

    // STUDENT_RESPONSIBLE and STUDENT: No access to these endpoints
    if (['STUDENT_RESPONSIBLE', 'STUDENT'].includes(roleName || '')) {
      throw AppException.forbidden('Acesso não autorizado')
    }

    // Unknown role: Deny access
    throw AppException.forbidden('Acesso não autorizado')
  }

  /**
   * Check if user belongs to the school
   */
  private async checkSchoolAccess(user: User, request: HttpContext['request']): Promise<boolean> {
    const classId = request.input('classId') || request.param('classId')

    // If classId is provided, check if user has access to that class's school
    if (classId) {
      const classEntity = await Class_.find(classId)

      if (!classEntity) return false

      const userSchool = await UserHasSchool.query()
        .where('userId', user.id)
        .where('schoolId', classEntity.schoolId)
        .first()
      return !!userSchool
    }

    // If no classId, check if user has any school association
    const userSchool = await UserHasSchool.query().where('userId', user.id).first()
    return !!userSchool
  }

  /**
   * Check if coordinator has access to the class
   * Coordinator has access if:
   * 1. They are coordinator of the course (Course.coordinatorId)
   * 2. They are coordinator of the level (via CoordinatorHasLevel)
   */
  private async checkCoordinatorAccess(
    user: User,
    request: HttpContext['request']
  ): Promise<boolean> {
    const classId = request.input('classId') || request.param('classId')

    if (!classId) return false

    // Get the class to find its level
    const classEntity = await Class_.find(classId)

    if (!classEntity) return false

    // Check if coordinator is assigned to any course that has this level
    const courseCoordinator = await Course.query()
      .where('coordinatorId', user.id)
      .whereHas(
        'courseAcademicPeriods',
        (capQuery: ModelQueryBuilderContract<typeof CourseHasAcademicPeriod>) => {
          capQuery.whereHas(
            'levelAssignments',
            (laQuery: ModelQueryBuilderContract<typeof LevelAssignedToCourseHasAcademicPeriod>) => {
              if (classEntity.levelId) {
                laQuery.where('levelId', classEntity.levelId)
              }
            }
          )
        }
      )
      .first()

    if (courseCoordinator) return true

    // Check via CoordinatorHasLevel table directly
    const levelCoordinator = await CoordinatorHasLevel.query()
      .where('coordinatorId', user.id)
      .whereHas(
        'levelAssignedToCourseHasAcademicPeriod',
        (laQuery: ModelQueryBuilderContract<typeof LevelAssignedToCourseHasAcademicPeriod>) => {
          if (classEntity.levelId) {
            laQuery.where('levelId', classEntity.levelId)
          }
        }
      )
      .first()

    return !!levelCoordinator
  }

  /**
   * Check if teacher teaches the subject in the class
   */
  private async checkTeacherAccess(user: User, request: HttpContext['request']): Promise<boolean> {
    const classId = request.input('classId') || request.param('classId')
    const subjectId = request.input('subjectId')

    if (!classId) return false

    // For available-dates and batch create, subjectId is required
    if (!subjectId) {
      // For class students stats, check if teacher teaches ANY subject in the class
      const teacherClass = await TeacherHasClass.query()
        .where('teacherId', user.id)
        .where('classId', classId)
        .where('isActive', true)
        .first()
      return !!teacherClass
    }

    // Check if teacher teaches this specific subject in this class
    const teacherClass = await TeacherHasClass.query()
      .where('teacherId', user.id)
      .where('classId', classId)
      .where('subjectId', subjectId)
      .where('isActive', true)
      .first()

    return !!teacherClass
  }
}
