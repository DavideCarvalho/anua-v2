import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

interface TeacherClassRow {
  id: string
  classId: string
  className: string
  classSlug: string
  schoolId: string
}

const ATTENDANCE_LOOKBACK_DAYS = 7
const RISK_LOOKBACK_DAYS = 30
const RISK_MIN_RECORDS = 10
const DEFAULT_MINIMUM_ATTENDANCE_PERCENTAGE = 75

export default class GetEscolaTeacherDashboardController {
  async handle(ctx: HttpContext) {
    const { auth, selectedSchoolIds } = ctx
    const user = ctx.effectiveUser ?? auth.user!

    if (user.roleId && !user.$preloaded.role) {
      await user.load('role')
    }

    if (user.role?.name !== 'SCHOOL_TEACHER') {
      return {
        stats: {
          classesCount: 0,
          studentsCount: 0,
          pendingGradesCount: 0,
          classesWithoutRecentAttendance: 0,
          atRiskStudentsCount: 0,
        },
        alerts: [],
      }
    }

    const now = DateTime.now()
    const today = now.toSQLDate()!
    const attendanceLookbackDate = now.minus({ days: ATTENDANCE_LOOKBACK_DAYS }).toSQLDate()!
    const riskLookbackDate = now.minus({ days: RISK_LOOKBACK_DAYS }).toSQLDate()!

    const teacherClassesResult = await db.rawQuery<{ rows: TeacherClassRow[] }>(
      `
        SELECT DISTINCT
          thc.id,
          c.id as "classId",
          c.name as "className",
          c.slug as "classSlug",
          c."schoolId" as "schoolId"
        FROM "TeacherHasClass" thc
        JOIN "Class" c ON c.id = thc."classId"
        WHERE thc."teacherId" = :teacherId
          AND thc."isActive" = true
          AND c."isArchived" = false
          AND (:hasSchoolScope = false OR c."schoolId" = ANY(:schoolIds))
      `,
      {
        teacherId: user.id,
        schoolIds: selectedSchoolIds ?? [],
        hasSchoolScope: (selectedSchoolIds?.length ?? 0) > 0,
      }
    )

    const teacherClasses = teacherClassesResult.rows
    const teacherClassIds = teacherClasses.map((tc) => tc.id)
    const classIds = [...new Set(teacherClasses.map((tc) => tc.classId))]
    const schoolIds = [...new Set(teacherClasses.map((tc) => tc.schoolId))]

    if (teacherClassIds.length === 0 || classIds.length === 0) {
      return {
        stats: {
          classesCount: 0,
          studentsCount: 0,
          pendingGradesCount: 0,
          classesWithoutRecentAttendance: 0,
          atRiskStudentsCount: 0,
        },
        alerts: [],
      }
    }

    const schoolConfigResult = await db
      .from('School')
      .whereIn('id', schoolIds)
      .max('minimumAttendancePercentage as maxMinimumAttendance')
      .first()

    const minimumAttendancePercentage = Math.min(
      100,
      Math.max(
        0,
        Number(schoolConfigResult?.maxMinimumAttendance ?? DEFAULT_MINIMUM_ATTENDANCE_PERCENTAGE)
      )
    )
    const failByAbsenceThreshold = 1 - minimumAttendancePercentage / 100
    const alertRiskThreshold = Math.max(0.1, failByAbsenceThreshold - 0.05)

    const studentsCountResult = await db
      .from('StudentHasLevel')
      .whereIn('classId', classIds)
      .whereNull('deletedAt')
      .countDistinct('studentId as total')
      .first()

    const pendingGradesResult = await db
      .from('StudentHasAssignment')
      .join('Assignment', 'StudentHasAssignment.assignmentId', 'Assignment.id')
      .whereIn('Assignment.teacherHasClassId', teacherClassIds)
      .where('Assignment.dueDate', '<=', today)
      .whereNull('StudentHasAssignment.grade')
      .count('* as total')
      .first()

    const pendingExamGradesResult = await db
      .from('exam_grades')
      .join('exams', 'exam_grades.examId', 'exams.id')
      .where('exams.teacherId', user.id)
      .where('exams.examDate', '<=', today)
      .where('exam_grades.attended', true)
      .whereNull('exam_grades.score')
      .count('* as total')
      .first()

    const classesWithoutAttendanceResult = await db.rawQuery<{
      rows: Array<{ total: number | string }>
    }>(
      `
        SELECT COUNT(*) as total
        FROM (
          SELECT thc.id
          FROM "TeacherHasClass" thc
          JOIN "Class" c ON c.id = thc."classId"
          WHERE thc.id = ANY(:teacherClassIds)
            AND NOT EXISTS (
              SELECT 1
              FROM "CalendarSlot" cs
              JOIN "Attendance" a ON a."calendarSlotId" = cs.id
              WHERE cs."teacherHasClassId" = thc.id
                AND a.date::date >= :attendanceLookbackDate::date
                AND a.date::date <= :today::date
            )
        ) as classes_without_attendance
      `,
      {
        teacherClassIds,
        attendanceLookbackDate,
        today,
      }
    )

    const atRiskStudentsResult = await db.rawQuery<{
      rows: Array<{
        studentId: string
        studentName: string
        total: number | string
        absences: number | string
      }>
    }>(
      `
        SELECT
          sha."studentId" as "studentId",
          u.name as "studentName",
          COUNT(*) as total,
          SUM(CASE WHEN sha.status = 'ABSENT' THEN 1 ELSE 0 END) as absences
        FROM "StudentHasAttendance" sha
        JOIN "Attendance" a ON a.id = sha."attendanceId"
        JOIN "CalendarSlot" cs ON cs.id = a."calendarSlotId"
        JOIN "Student" s ON s.id = sha."studentId"
        JOIN "User" u ON u.id = s.id
        WHERE cs."teacherHasClassId" = ANY(:teacherClassIds)
          AND a.date::date >= :riskLookbackDate::date
          AND a.date::date <= :today::date
          AND u."deletedAt" IS NULL
        GROUP BY sha."studentId", u.name
        HAVING COUNT(*) >= :riskMinRecords
          AND (SUM(CASE WHEN sha.status = 'ABSENT' THEN 1 ELSE 0 END)::float / COUNT(*)) >= :alertRiskThreshold
      `,
      {
        teacherClassIds,
        riskLookbackDate,
        riskMinRecords: RISK_MIN_RECORDS,
        alertRiskThreshold,
        today,
      }
    )

    const pendingAssignmentGradesCount = Number(pendingGradesResult?.total ?? 0)
    const pendingExamGradesCount = Number(pendingExamGradesResult?.total ?? 0)
    const pendingGradesCount = pendingAssignmentGradesCount + pendingExamGradesCount
    const classesWithoutRecentAttendance = Number(
      classesWithoutAttendanceResult.rows[0]?.total ?? 0
    )
    const atRiskStudentsCount = atRiskStudentsResult.rows.length
    const highestAbsenceRate = atRiskStudentsResult.rows.reduce((highest, item) => {
      const total = Number(item.total)
      const absences = Number(item.absences)
      if (total <= 0) return highest

      const currentRate = absences / total
      return Math.max(highest, currentRate)
    }, 0)

    const alerts: Array<{
      id: string
      priority: 'high' | 'medium'
      title: string
      description: string
      href: string
    }> = []

    if (classesWithoutRecentAttendance > 0) {
      alerts.push({
        id: 'attendance-missing',
        priority: 'high',
        title: 'Aulas sem chamada recente',
        description: `${classesWithoutRecentAttendance} turma(s) sem registro de presença nos últimos ${ATTENDANCE_LOOKBACK_DAYS} dias`,
        href: '/escola/pedagogico/presenca',
      })
    }

    if (pendingAssignmentGradesCount > 0) {
      alerts.push({
        id: 'assignment-grades-missing',
        priority: 'high',
        title: 'Notas pendentes em atividades',
        description: `${pendingAssignmentGradesCount} lançamento(s) de atividade(s) já vencida(s) sem nota`,
        href: '/escola/pedagogico/atividades',
      })
    }

    if (pendingExamGradesCount > 0) {
      alerts.push({
        id: 'exam-grades-missing',
        priority: 'high',
        title: 'Notas pendentes em provas',
        description: `${pendingExamGradesCount} lançamento(s) de prova(s) já aplicada(s) sem nota`,
        href: '/escola/pedagogico/provas',
      })
    }

    if (atRiskStudentsCount > 0) {
      const thresholdPct = Math.round(failByAbsenceThreshold * 100)
      const currentRatePct = Math.round(highestAbsenceRate * 100)
      const minimumAttendancePct = Math.round(minimumAttendancePercentage)
      alerts.push({
        id: 'absence-risk',
        priority: 'medium',
        title: 'Alunos em risco por falta',
        description: `${atRiskStudentsCount} aluno(s) com padrão atual de faltas (até ${currentRatePct}%) e risco de ultrapassar ${thresholdPct}% (mínimo ${minimumAttendancePct}% de presença)`,
        href: '/escola/pedagogico/presenca',
      })
    }

    return {
      stats: {
        classesCount: classIds.length,
        studentsCount: Number(studentsCountResult?.total ?? 0),
        pendingGradesCount,
        classesWithoutRecentAttendance,
        atRiskStudentsCount,
      },
      alerts,
      classes: teacherClasses.map((item) => ({
        id: item.classId,
        name: item.className,
        slug: item.classSlug,
      })),
    }
  }
}
