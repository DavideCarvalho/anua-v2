import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import { getPedagogicalCreationContextValidator } from '#validators/pedagogical_calendar'

interface ContextRow {
  academicPeriodId: string
  academicPeriodName: string
  classId: string
  className: string
  levelId: string | null
  levelName: string | null
  subjectId: string
  subjectName: string
  teacherId: string
}

export default class GetCreationContextController {
  async handle({ auth, request, response, selectedSchoolIds }: HttpContext) {
    const { academicPeriodId } = await request.validateUsing(getPedagogicalCreationContextValidator)

    const authUser = auth.user
    if (!authUser) {
      return response.unauthorized({ message: 'Usuário não autenticado' })
    }

    const roleRecord = authUser.roleId
      ? await Role.query().where('id', authUser.roleId).select('name').first()
      : null
    const roleName = roleRecord?.name ?? null

    const baseQuery = db
      .from('Calendar as c')
      .innerJoin('AcademicPeriod as ap', 'ap.id', 'c.academicPeriodId')
      .innerJoin('Class as cl', 'cl.id', 'c.classId')
      .innerJoin('CalendarSlot as cs', 'cs.calendarId', 'c.id')
      .innerJoin('TeacherHasClass as thc', 'thc.id', 'cs.teacherHasClassId')
      .innerJoin('Subject as s', 's.id', 'thc.subjectId')
      .leftJoin('Level as l', 'l.id', 'cl.levelId')
      .whereIn('cl.schoolId', selectedSchoolIds ?? [])
      .where('ap.isActive', true)
      .where('c.isActive', true)
      .where('c.isCanceled', false)
      .where('thc.isActive', true)
      .where('cs.isBreak', false)
      .whereNotNull('cs.teacherHasClassId')

    if (academicPeriodId) {
      baseQuery.where('ap.id', academicPeriodId)
    }

    if (roleName === 'SCHOOL_COORDINATOR') {
      const levelIdsFromCourses = await db
        .from('Course as course')
        .innerJoin('CourseHasAcademicPeriod as cap', 'cap.courseId', 'course.id')
        .innerJoin(
          'LevelAssignedToCourseHasAcademicPeriod as la',
          'la.courseHasAcademicPeriodId',
          'cap.id'
        )
        .where('course.coordinatorId', authUser.id)
        .select('la.levelId')

      const levelIdsFromCoordinatorLinks = await db
        .from('CoordinatorHasLevel as chl')
        .innerJoin(
          'LevelAssignedToCourseHasAcademicPeriod as la',
          'la.id',
          'chl.levelAssignedToCourseHasAcademicPeriodId'
        )
        .where('chl.coordinatorId', authUser.id)
        .select('la.levelId')

      const allowedLevelIds = Array.from(
        new Set(
          [...levelIdsFromCourses, ...levelIdsFromCoordinatorLinks]
            .map((row) => row.levelId as string | null)
            .filter((levelId): levelId is string => !!levelId)
        )
      )

      if (allowedLevelIds.length === 0) {
        return response.ok({
          data: {
            rows: [],
            periods: [],
            levels: [],
            classes: [],
            subjects: [],
          },
        })
      }

      baseQuery.whereIn('cl.levelId', allowedLevelIds)
    }

    if (roleName === 'SCHOOL_TEACHER') {
      baseQuery.where('thc.teacherId', authUser.id)
    }

    const rows = (await baseQuery
      .select(
        'ap.id as academicPeriodId',
        'ap.name as academicPeriodName',
        'cl.id as classId',
        'cl.name as className',
        'l.id as levelId',
        'l.name as levelName',
        's.id as subjectId',
        's.name as subjectName',
        'thc.teacherId as teacherId'
      )
      .orderBy('ap.name', 'asc')
      .orderBy('l.name', 'asc')
      .orderBy('cl.name', 'asc')
      .orderBy('s.name', 'asc')) as ContextRow[]

    const uniqueRows = new Map<string, ContextRow>()

    for (const row of rows) {
      const key = `${row.academicPeriodId}:${row.classId}:${row.subjectId}:${row.teacherId}`
      if (!uniqueRows.has(key)) uniqueRows.set(key, row)
    }

    const normalizedRows = Array.from(uniqueRows.values())

    const periods = Array.from(
      new Map(normalizedRows.map((row) => [row.academicPeriodId, row.academicPeriodName])).entries()
    ).map(([id, name]) => ({ id, name }))

    const levels = Array.from(
      new Map(
        normalizedRows
          .filter((row) => row.levelId)
          .map((row) => [row.levelId as string, row.levelName ?? 'Sem série'])
      ).entries()
    ).map(([id, name]) => ({ id, name }))

    const classes = Array.from(
      new Map(
        normalizedRows.map((row) => [row.classId, { id: row.classId, name: row.className }])
      ).values()
    )

    const subjects = Array.from(
      new Map(
        normalizedRows.map((row) => [
          `${row.classId}:${row.subjectId}:${row.teacherId}`,
          {
            id: row.subjectId,
            name: row.subjectName,
            classId: row.classId,
            teacherId: row.teacherId,
          },
        ])
      ).values()
    )

    return response.ok({
      data: {
        rows: normalizedRows,
        periods,
        levels,
        classes,
        subjects,
      },
    })
  }
}
