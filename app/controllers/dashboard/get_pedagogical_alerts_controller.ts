import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'

interface AtRiskByAttendanceStudent {
  studentId: string
  studentName: string
  className: string
  courseName: string
  levelName: string
  totalClasses: number
  absences: number
  absenceRate: number
  attendanceRate: number
}

interface AtRiskByGradeStudent {
  studentId: string
  studentName: string
  className: string
  averageGrade: number
  minimumRequired: number
  deficit: number
  gradedItems: number
}

interface AtRiskByGradeRow {
  student_id: string
  student_name: string
  class_name: string
  final_grade: string | number
  graded_assignments: string | number
  graded_exams: string | number
}

interface ExamWithoutGrade {
  examId: string
  examTitle: string
  examDate: string
  className: string
  courseName: string
  levelName: string
  teacherName: string
  daysPast: number
}

interface OverdueActivity {
  assignmentId: string
  assignmentName: string
  dueDate: string
  className: string
  courseName: string
  levelName: string
  teacherName: string
  daysPast: number
  totalStudents: number
  gradedStudents: number
}

interface UngradedSubmission {
  submissionId: string
  studentName: string
  className: string
  assignmentName: string
  submittedAt: string
  daysWaiting: number
}

interface UngradedSubmissionRow {
  submission_id: string
  student_name: string
  class_name: string
  assignment_name: string
  submitted_at: string
  days_waiting: string | number
}

interface TeacherMissingAttendance {
  teacherId: string
  teacherName: string
  classes: string[]
  daysWithoutAttendance: number
  neverRegistered?: boolean
}

interface TeacherMissingAttendanceRow {
  teacher_id: string
  teacher_name: string
  classes: string[]
  days_without_attendance: string | number
  never_registered: boolean
}

interface PedagogicalAlerts {
  studentsAtRiskByAttendance?: {
    count: number
    threshold: number
    students: AtRiskByAttendanceStudent[]
  }
  studentsAtRiskByGrade?: {
    count: number
    minimumGrade: number
    calculationAlgorithm: string
    students: AtRiskByGradeStudent[]
  }
  examsWithoutGrades?: {
    count: number
    exams: ExamWithoutGrade[]
  }
  overdueActivities?: {
    count: number
    activities: OverdueActivity[]
  }
  ungradedSubmissions?: {
    count: number
    submissions: UngradedSubmission[]
  }
  teachersMissingAttendance?: {
    count: number
    daysThreshold: number
    teachers: TeacherMissingAttendance[]
  }
}

interface PedagogicalAlertFilters {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

function normalizeFilter(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value || value === 'all') return undefined
  return value
}

export default class GetPedagogicalAlertsController {
  async handle({
    selectedSchoolIds,
    request,
  }: HttpContext): Promise<{ alerts: PedagogicalAlerts }> {
    const scopedSchoolIds = selectedSchoolIds ?? []
    if (scopedSchoolIds.length === 0) {
      return { alerts: {} }
    }

    const schoolId = scopedSchoolIds[0]
    const school = await School.find(schoolId)
    if (!school) {
      return { alerts: {} }
    }

    const minimumGrade = school.minimumGrade ?? 6
    const minimumAttendancePercentage = school.minimumAttendancePercentage ?? 75
    const calculationAlgorithm = school.calculationAlgorithm ?? 'AVERAGE'
    const alerts: PedagogicalAlerts = {}

    const query = request.qs() as Record<string, unknown>
    const filters: PedagogicalAlertFilters = {
      academicPeriodId: normalizeFilter(query.academicPeriodId),
      courseId: normalizeFilter(query.courseId),
      levelId: normalizeFilter(query.levelId),
      classId: normalizeFilter(query.classId),
    }

    const scopedClassIds = await this.resolveScopedClassIds(schoolId, filters)
    const hasClassScope =
      Boolean(filters.academicPeriodId) ||
      Boolean(filters.courseId) ||
      Boolean(filters.levelId) ||
      Boolean(filters.classId)

    const [
      attendanceRiskStudents,
      gradeRiskStudents,
      examsWithoutGrades,
      overdueActivities,
      ungradedSubmissions,
      teachersMissingAttendance,
    ] = await Promise.all([
      this.getStudentsAtRiskByAttendance(
        schoolId,
        minimumAttendancePercentage,
        hasClassScope,
        scopedClassIds
      ),
      this.getStudentsAtRiskByGrade(
        schoolId,
        minimumGrade,
        calculationAlgorithm,
        hasClassScope,
        scopedClassIds
      ),
      this.getExamsWithoutGrades(schoolId, hasClassScope, scopedClassIds),
      this.getOverdueActivities(schoolId, hasClassScope, scopedClassIds),
      this.getUngradedSubmissions(schoolId, hasClassScope, scopedClassIds),
      this.getTeachersMissingAttendance(schoolId, 7, hasClassScope, scopedClassIds),
    ])

    if (attendanceRiskStudents.length > 0) {
      alerts.studentsAtRiskByAttendance = {
        count: attendanceRiskStudents.length,
        threshold: minimumAttendancePercentage,
        students: attendanceRiskStudents,
      }
    }

    if (gradeRiskStudents.length > 0) {
      alerts.studentsAtRiskByGrade = {
        count: gradeRiskStudents.length,
        minimumGrade,
        calculationAlgorithm,
        students: gradeRiskStudents,
      }
    }

    if (examsWithoutGrades.length > 0) {
      alerts.examsWithoutGrades = {
        count: examsWithoutGrades.length,
        exams: examsWithoutGrades,
      }
    }

    if (overdueActivities.length > 0) {
      alerts.overdueActivities = {
        count: overdueActivities.length,
        activities: overdueActivities,
      }
    }

    if (ungradedSubmissions.length > 0) {
      alerts.ungradedSubmissions = {
        count: ungradedSubmissions.length,
        submissions: ungradedSubmissions,
      }
    }

    if (teachersMissingAttendance.length > 0) {
      alerts.teachersMissingAttendance = {
        count: teachersMissingAttendance.length,
        daysThreshold: 7,
        teachers: teachersMissingAttendance,
      }
    }

    return { alerts }
  }

  private async getStudentsAtRiskByAttendance(
    schoolId: string,
    minimumAttendancePercentage: number,
    hasClassScope: boolean,
    scopedClassIds: string[]
  ): Promise<AtRiskByAttendanceStudent[]> {
    const result = await db.rawQuery(
      `
      WITH class_attendance_count AS (
        SELECT
          c.id as class_id,
          COUNT(DISTINCT a.id) as total_sessions
        FROM "Class" c
        LEFT JOIN "TeacherHasClass" thc ON thc."classId" = c.id
        LEFT JOIN "CalendarSlot" cs ON cs."teacherHasClassId" = thc.id
        LEFT JOIN "Attendance" a ON a."calendarSlotId" = cs.id
        WHERE c."schoolId" = :schoolId
        AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
        GROUP BY c.id
      ),
      student_attendance AS (
        SELECT
          st.id as student_id,
          u.name as student_name,
          c.name as class_name,
          c.id as class_id,
          COALESCE(co.name, 'Sem curso') as course_name,
          COALESCE(l.name, 'Sem nível') as level_name,
          COUNT(sha.id) as recorded_classes,
          COALESCE(SUM(CASE WHEN sha.status = 'ABSENT' THEN 1 ELSE 0 END), 0) as absences,
          COALESCE(SUM(CASE WHEN sha.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END), 0) as present
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "Class" c ON st."classId" = c.id
        JOIN "Level" l ON c."levelId" = l.id
        LEFT JOIN "LevelAssignedToCourseHasAcademicPeriod" latcap ON latcap."levelId" = c."levelId" AND latcap."isActive" = true
        LEFT JOIN "CourseHasAcademicPeriod" chap ON latcap."courseHasAcademicPeriodId" = chap.id
        LEFT JOIN "Course" co ON chap."courseId" = co.id
        LEFT JOIN "StudentHasAttendance" sha ON sha."studentId" = st.id
        WHERE c."schoolId" = :schoolId
        AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
        AND st."enrollmentStatus" = 'REGISTERED'
        GROUP BY st.id, u.name, c.name, c.id, co.name, l.name
      )
      SELECT
        sa.student_id,
        sa.student_name,
        sa.class_name,
        sa.course_name,
        sa.level_name,
        sa.recorded_classes,
        COALESCE(cac.total_sessions, 0) as total_sessions,
        sa.absences,
        sa.present,
        CASE WHEN sa.recorded_classes > 0
          THEN ROUND((sa.absences::float / sa.recorded_classes * 100)::numeric, 1)
          ELSE 0
        END as absence_rate,
        CASE WHEN sa.recorded_classes > 0
          THEN ROUND((sa.present::float / sa.recorded_classes * 100)::numeric, 1)
          ELSE 0
        END as attendance_rate
      FROM student_attendance sa
      LEFT JOIN class_attendance_count cac ON cac.class_id = sa.class_id
      WHERE (sa.recorded_classes = 0 AND COALESCE(cac.total_sessions, 0) > 0)
         OR (sa.recorded_classes >= 5 AND (sa.absences::float / sa.recorded_classes * 100) > :minAttendanceThreshold)
      ORDER BY
        CASE WHEN sa.recorded_classes = 0 THEN 0 ELSE 1 END,
        absence_rate DESC
      LIMIT 50
      `,
      {
        schoolId,
        minAttendanceThreshold: 100 - minimumAttendancePercentage,
        hasClassScope,
        scopedClassIds,
      }
    )

    return (result.rows as any[]).map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      className: row.class_name,
      courseName: row.course_name,
      levelName: row.level_name,
      totalClasses:
        Number(row.recorded_classes) > 0
          ? Number(row.recorded_classes)
          : Number(row.total_sessions),
      absences: Number(row.absences),
      absenceRate: Number(row.absence_rate),
      attendanceRate: Number(row.attendance_rate),
    }))
  }

  private async getStudentsAtRiskByGrade(
    schoolId: string,
    minimumGrade: number,
    calculationAlgorithm: string,
    hasClassScope: boolean,
    scopedClassIds: string[]
  ): Promise<AtRiskByGradeStudent[]> {
    const result = await db.rawQuery(
      `
      WITH student_grades AS (
        SELECT 
          st.id as student_id,
          u.name as student_name,
          c.name as class_name,
          COUNT(DISTINCT sha.id) as graded_assignments,
          AVG(CASE WHEN a.grade > 0 THEN (sha.grade::float / a.grade::float) * 10 END) as assignment_avg,
          COUNT(DISTINCT eg.id) as graded_exams,
          AVG(eg.score) as exam_avg
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "Class" c ON st."classId" = c.id
        LEFT JOIN "StudentHasAssignment" sha ON sha."studentId" = st.id AND sha.grade IS NOT NULL
        LEFT JOIN "Assignment" a ON sha."assignmentId" = a.id
        LEFT JOIN exam_grades eg ON eg."studentId" = st.id AND eg.score IS NOT NULL AND eg.attended = true
        WHERE c."schoolId" = :schoolId
        AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
        AND st."enrollmentStatus" = 'REGISTERED'
        GROUP BY st.id, u.name, c.name
        HAVING COUNT(sha.id) > 0 OR COUNT(eg.id) > 0
      )
      SELECT 
        student_id,
        student_name,
        class_name,
        graded_assignments,
        graded_exams,
        assignment_avg,
        exam_avg,
          CASE 
            WHEN :algorithm = 'AVERAGE' THEN 
              ROUND(((COALESCE(assignment_avg, 0) * graded_assignments + 
                     COALESCE(exam_avg, 0) * graded_exams) /
                     NULLIF(graded_assignments + graded_exams, 0))::numeric, 1)
          WHEN :algorithm = 'SUM' THEN
            ROUND((COALESCE(assignment_avg, 0) * graded_assignments + 
                   COALESCE(exam_avg, 0) * graded_exams)::numeric, 1)
          ELSE ROUND(((COALESCE(assignment_avg, 0) * graded_assignments + 
                      COALESCE(exam_avg, 0) * graded_exams) /
                      NULLIF(graded_assignments + graded_exams, 0))::numeric, 1)
        END as final_grade
      FROM student_grades
      WHERE (
        CASE 
          WHEN :algorithm = 'AVERAGE' THEN 
            ((COALESCE(assignment_avg, 0) * graded_assignments + 
             COALESCE(exam_avg, 0) * graded_exams) /
             NULLIF(graded_assignments + graded_exams, 0))
          WHEN :algorithm = 'SUM' THEN
            (COALESCE(assignment_avg, 0) * graded_assignments + 
             COALESCE(exam_avg, 0) * graded_exams)
          ELSE 
            ((COALESCE(assignment_avg, 0) * graded_assignments + 
             COALESCE(exam_avg, 0) * graded_exams) /
             NULLIF(graded_assignments + graded_exams, 0))
        END
      ) < :minimumGrade
      ORDER BY final_grade ASC
      LIMIT 50
      `,
      {
        schoolId,
        minimumGrade,
        algorithm: calculationAlgorithm,
        hasClassScope,
        scopedClassIds,
      }
    )

    return (result.rows as AtRiskByGradeRow[]).map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      className: row.class_name,
      averageGrade: Number(row.final_grade),
      minimumRequired: minimumGrade,
      deficit: Math.round((minimumGrade - Number(row.final_grade)) * 10) / 10,
      gradedItems: Number(row.graded_assignments) + Number(row.graded_exams),
    }))
  }

  private async getExamsWithoutGrades(
    schoolId: string,
    hasClassScope: boolean,
    scopedClassIds: string[]
  ): Promise<ExamWithoutGrade[]> {
    const result = await db.rawQuery(
      `
      SELECT
        e.id as exam_id,
        e.title as exam_title,
        e."examDate",
        c.name as class_name,
        COALESCE(co.name, 'Sem curso') as course_name,
        COALESCE(l.name, 'Sem nível') as level_name,
        u.name as teacher_name,
        EXTRACT(DAY FROM NOW() - e."examDate") as days_past
      FROM exams e
      JOIN "Class" c ON e."classId" = c.id
      JOIN "Level" l ON c."levelId" = l.id
      LEFT JOIN "LevelAssignedToCourseHasAcademicPeriod" latcap ON latcap."levelId" = c."levelId" AND latcap."isActive" = true
      LEFT JOIN "CourseHasAcademicPeriod" chap ON latcap."courseHasAcademicPeriodId" = chap.id
      LEFT JOIN "Course" co ON chap."courseId" = co.id
      JOIN "User" u ON e."teacherId" = u.id
       WHERE e."schoolId" = :schoolId
       AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
       AND e."examDate" < NOW()
      AND EXTRACT(DAY FROM NOW() - e."examDate") >= 5
      AND NOT EXISTS (
        SELECT 1 FROM exam_grades eg
        WHERE eg."examId" = e.id
        AND eg.score IS NOT NULL
      )
      ORDER BY e."examDate" ASC
      LIMIT 50
      `,
      { schoolId, hasClassScope, scopedClassIds }
    )

    return (result.rows as any[]).map((row) => ({
      examId: row.exam_id,
      examTitle: row.exam_title,
      examDate: row.examDate,
      className: row.class_name,
      courseName: row.course_name,
      levelName: row.level_name,
      teacherName: row.teacher_name,
      daysPast: Math.round(Number(row.days_past)),
    }))
  }

  private async getOverdueActivities(
    schoolId: string,
    hasClassScope: boolean,
    scopedClassIds: string[]
  ): Promise<OverdueActivity[]> {
    const result = await db.rawQuery(
      `
      SELECT
        a.id as assignment_id,
        a.name as assignment_name,
        a."dueDate",
        c.name as class_name,
        COALESCE(co.name, 'Sem curso') as course_name,
        COALESCE(l.name, 'Sem nível') as level_name,
        u.name as teacher_name,
        COUNT(sha.id) as total_students,
        COUNT(CASE WHEN sha.grade IS NOT NULL AND sha.grade > 0 THEN 1 END) as graded_students,
        EXTRACT(DAY FROM NOW() - a."dueDate") as days_past
      FROM "Assignment" a
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "Level" l ON c."levelId" = l.id
      LEFT JOIN "LevelAssignedToCourseHasAcademicPeriod" latcap ON latcap."levelId" = c."levelId" AND latcap."isActive" = true
      LEFT JOIN "CourseHasAcademicPeriod" chap ON latcap."courseHasAcademicPeriodId" = chap.id
      LEFT JOIN "Course" co ON chap."courseId" = co.id
      JOIN "User" u ON thc."teacherId" = u.id
      LEFT JOIN "StudentHasAssignment" sha ON sha."assignmentId" = a.id
       WHERE c."schoolId" = :schoolId
       AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
       AND a."dueDate" < NOW()
      AND EXTRACT(DAY FROM NOW() - a."dueDate") >= 5
      AND a.grade IS NOT NULL
      AND a.grade > 0
      GROUP BY a.id, a.name, a."dueDate", c.name, co.name, l.name, u.name
      HAVING COUNT(sha.id) = 0
         OR COUNT(CASE WHEN sha.grade IS NOT NULL AND sha.grade > 0 THEN 1 END) < COUNT(sha.id)
      ORDER BY a."dueDate" ASC
      LIMIT 50
      `,
      { schoolId, hasClassScope, scopedClassIds }
    )

    return (result.rows as any[]).map((row) => ({
      assignmentId: row.assignment_id,
      assignmentName: row.assignment_name,
      dueDate: row.dueDate,
      className: row.class_name,
      courseName: row.course_name,
      levelName: row.level_name,
      teacherName: row.teacher_name,
      daysPast: Math.round(Number(row.days_past)),
      totalStudents: Number(row.total_students),
      gradedStudents: Number(row.graded_students),
    }))
  }

  private async getUngradedSubmissions(
    schoolId: string,
    hasClassScope: boolean,
    scopedClassIds: string[]
  ): Promise<UngradedSubmission[]> {
    const result = await db.rawQuery(
      `
      SELECT 
        sha.id as submission_id,
        u.name as student_name,
        c.name as class_name,
        a.name as assignment_name,
        sha."createdAt" as submitted_at,
        EXTRACT(DAY FROM NOW() - sha."createdAt") as days_waiting
      FROM "StudentHasAssignment" sha
      JOIN "Student" st ON sha."studentId" = st.id
      JOIN "User" u ON st.id = u.id
      JOIN "Class" c ON st."classId" = c.id
      JOIN "Assignment" a ON sha."assignmentId" = a.id
       WHERE c."schoolId" = :schoolId
       AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
       AND sha.grade IS NULL
      AND a.grade IS NOT NULL
      AND a.grade > 0
      ORDER BY sha."createdAt" ASC
      LIMIT 50
      `,
      { schoolId, hasClassScope, scopedClassIds }
    )

    return (result.rows as UngradedSubmissionRow[]).map((row) => ({
      submissionId: row.submission_id,
      studentName: row.student_name,
      className: row.class_name,
      assignmentName: row.assignment_name,
      submittedAt: row.submitted_at,
      daysWaiting: Math.round(Number(row.days_waiting)),
    }))
  }

  private async getTeachersMissingAttendance(
    schoolId: string,
    daysThreshold: number,
    hasClassScope: boolean,
    scopedClassIds: string[]
  ): Promise<TeacherMissingAttendance[]> {
    const result = await db.rawQuery(
      `
      WITH active_period AS (
        SELECT "startDate"
        FROM "AcademicPeriod"
        WHERE "schoolId" = :schoolId
        AND "isActive" = true
        ORDER BY "startDate" DESC
        LIMIT 1
      ),
      teacher_last_attendance AS (
        SELECT 
          thc."teacherId",
          u.name as teacher_name,
          MAX(a.date) as last_attendance_date,
          array_agg(DISTINCT c.name) as classes
        FROM "TeacherHasClass" thc
        JOIN "User" u ON thc."teacherId" = u.id
        JOIN "Class" c ON thc."classId" = c.id
        LEFT JOIN "CalendarSlot" cs ON cs."teacherHasClassId" = thc.id
        LEFT JOIN "Attendance" a ON a."calendarSlotId" = cs.id
        WHERE c."schoolId" = :schoolId
        AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
        AND thc."isActive" = true
        GROUP BY thc."teacherId", u.name
      )
      SELECT 
        tla."teacherId" as teacher_id,
        tla.teacher_name,
        tla.classes,
        CASE 
          WHEN tla.last_attendance_date IS NULL THEN 
            EXTRACT(DAY FROM NOW() - COALESCE(ap."startDate", NOW()))
          ELSE 
            EXTRACT(DAY FROM NOW() - tla.last_attendance_date)
        END as days_without_attendance,
        tla.last_attendance_date IS NULL as never_registered
      FROM teacher_last_attendance tla
      CROSS JOIN active_period ap
      WHERE tla.last_attendance_date IS NULL
         OR tla.last_attendance_date < NOW() - INTERVAL '1 day' * :daysThreshold
      ORDER BY days_without_attendance DESC
      LIMIT 20
      `,
      { schoolId, daysThreshold, hasClassScope, scopedClassIds }
    )

    return (result.rows as TeacherMissingAttendanceRow[]).map((row) => ({
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      classes: row.classes || [],
      daysWithoutAttendance: Math.round(Number(row.days_without_attendance)),
      neverRegistered: row.never_registered,
    }))
  }

  private async resolveScopedClassIds(
    schoolId: string,
    filters: PedagogicalAlertFilters
  ): Promise<string[]> {
    const hasFilters =
      Boolean(filters.academicPeriodId) ||
      Boolean(filters.courseId) ||
      Boolean(filters.levelId) ||
      Boolean(filters.classId)

    if (!hasFilters) {
      return []
    }

    const classScopeQuery = db
      .from('Class as c')
      .join('Level as l', 'l.id', 'c.levelId')
      .leftJoin('LevelAssignedToCourseHasAcademicPeriod as latcap', (join) => {
        join.on('latcap.levelId', '=', 'l.id').andOnVal('latcap.isActive', '=', true)
      })
      .leftJoin('CourseHasAcademicPeriod as chap', 'chap.id', 'latcap.courseHasAcademicPeriodId')
      .where('c.schoolId', schoolId)
      .where('c.isArchived', false)
      .select('c.id')
      .distinct('c.id')

    if (filters.classId) {
      classScopeQuery.where('c.id', filters.classId)
    }
    if (filters.levelId) {
      classScopeQuery.where('c.levelId', filters.levelId)
    }
    if (filters.courseId) {
      classScopeQuery.where('chap.courseId', filters.courseId)
    }
    if (filters.academicPeriodId) {
      classScopeQuery.whereExists((subquery) => {
        subquery
          .from('ClassHasAcademicPeriod as chap2')
          .select(db.raw('1'))
          .whereColumn('chap2.classId', 'c.id')
          .where('chap2.academicPeriodId', filters.academicPeriodId!)
      })
    }

    const rows = await classScopeQuery
    return rows.map((row) => String(row.id))
  }
}
