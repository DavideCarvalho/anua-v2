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
  courseName: string
  levelName: string
  minimumRequired: number
  subjectsAtRisk: Array<{
    subjectName: string
    finalGrade: number
    deficit: number
  }>
}

interface AtRiskByGradeRow {
  student_id: string
  student_name: string
  class_name: string
  course_name: string
  level_name: string
  subjects_at_risk: Array<{
    subjectName: string
    finalGrade: number
    deficit: number
  }>
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
        scopedClassIds,
        filters.academicPeriodId
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
    scopedClassIds: string[],
    academicPeriodId?: string
  ): Promise<AtRiskByGradeStudent[]> {
    const result = await db.rawQuery(
      `
      WITH subject_scope AS (
        SELECT DISTINCT
          c.id as class_id,
          c.name as class_name,
          COALESCE(co.name, 'Sem curso') as course_name,
          COALESCE(l.name, 'Sem nível') as level_name,
          thc."subjectId" as subject_id,
          sb.name as subject_name
        FROM "TeacherHasClass" thc
        JOIN "Class" c ON c.id = thc."classId"
        JOIN "Subject" sb ON sb.id = thc."subjectId"
        JOIN "Level" l ON c."levelId" = l.id
        LEFT JOIN "LevelAssignedToCourseHasAcademicPeriod" latcap ON latcap."levelId" = c."levelId" AND latcap."isActive" = true
        LEFT JOIN "CourseHasAcademicPeriod" chap ON chap.id = latcap."courseHasAcademicPeriodId"
        LEFT JOIN "Course" co ON co.id = chap."courseId"
        WHERE c."schoolId" = :schoolId
          AND c."isArchived" = false
          AND thc."isActive" = true
          AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
      ),
      students_scope AS (
        SELECT 
          st.id as student_id,
          u.name as student_name,
          c.id as class_id
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "Class" c ON st."classId" = c.id
        WHERE c."schoolId" = :schoolId
          AND c."isArchived" = false
          AND st."enrollmentStatus" = 'REGISTERED'
          AND (:hasClassScope = false OR c.id = ANY(:scopedClassIds))
      ),
      assignment_totals AS (
        SELECT
          thc."classId" as class_id,
          thc."subjectId" as subject_id,
          COUNT(*) FILTER (WHERE a.grade > 0) as total_gradable_assignments
        FROM "TeacherHasClass" thc
        LEFT JOIN "Assignment" a ON a."teacherHasClassId" = thc.id
          AND (:academicPeriodId::text IS NULL OR a."academicPeriodId" = :academicPeriodId)
        GROUP BY thc."classId", thc."subjectId"
      ),
      exam_totals AS (
        SELECT
          e."classId" as class_id,
          e."subjectId" as subject_id,
          COUNT(*) FILTER (WHERE e."maxScore" > 0) as total_gradable_exams
        FROM exams e
        WHERE (:academicPeriodId::text IS NULL OR e."academicPeriodId" = :academicPeriodId)
        GROUP BY e."classId", e."subjectId"
      ),
      student_assignment_scores AS (
        SELECT
          sha."studentId" as student_id,
          thc."classId" as class_id,
          thc."subjectId" as subject_id,
          COUNT(*) FILTER (WHERE a.grade > 0 AND sha.grade IS NOT NULL) as graded_assignments,
          COALESCE(SUM(sha.grade) FILTER (WHERE a.grade > 0 AND sha.grade IS NOT NULL), 0) as assignment_sum
        FROM "StudentHasAssignment" sha
        JOIN "Assignment" a ON a.id = sha."assignmentId"
          AND (:academicPeriodId::text IS NULL OR a."academicPeriodId" = :academicPeriodId)
        JOIN "TeacherHasClass" thc ON thc.id = a."teacherHasClassId"
        GROUP BY sha."studentId", thc."classId", thc."subjectId"
      ),
      student_exam_scores AS (
        SELECT
          eg."studentId" as student_id,
          e."classId" as class_id,
          e."subjectId" as subject_id,
          COUNT(*) FILTER (WHERE e."maxScore" > 0 AND eg.score IS NOT NULL AND eg.attended = true) as graded_exams,
          COALESCE(SUM(eg.score) FILTER (WHERE e."maxScore" > 0 AND eg.score IS NOT NULL AND eg.attended = true), 0) as exam_sum
        FROM exam_grades eg
        JOIN exams e ON e.id = eg."examId"
        WHERE (:academicPeriodId::text IS NULL OR e."academicPeriodId" = :academicPeriodId)
        GROUP BY eg."studentId", e."classId", e."subjectId"
      ),
      student_subject_performance AS (
        SELECT
          st.student_id,
          st.student_name,
          ss.class_name,
          ss.course_name,
          ss.level_name,
          ss.subject_name,
          COALESCE(at.total_gradable_assignments, 0) as total_gradable_assignments,
          COALESCE(et.total_gradable_exams, 0) as total_gradable_exams,
          COALESCE(sas.graded_assignments, 0) as graded_assignments,
          COALESCE(ses.graded_exams, 0) as graded_exams,
          COALESCE(sas.assignment_sum, 0) as assignment_sum,
          COALESCE(ses.exam_sum, 0) as exam_sum,
          CASE
            WHEN :algorithm = 'SUM' THEN (COALESCE(sas.assignment_sum, 0) + COALESCE(ses.exam_sum, 0))::float
            ELSE CASE
              WHEN (COALESCE(sas.graded_assignments, 0) + COALESCE(ses.graded_exams, 0)) > 0
                THEN ((COALESCE(sas.assignment_sum, 0) + COALESCE(ses.exam_sum, 0)) /
                  NULLIF(COALESCE(sas.graded_assignments, 0) + COALESCE(ses.graded_exams, 0), 0))::float
              ELSE 0
            END
          END as final_grade
        FROM students_scope st
        JOIN subject_scope ss ON ss.class_id = st.class_id
        LEFT JOIN assignment_totals at ON at.class_id = ss.class_id AND at.subject_id = ss.subject_id
        LEFT JOIN exam_totals et ON et.class_id = ss.class_id AND et.subject_id = ss.subject_id
        LEFT JOIN student_assignment_scores sas ON sas.student_id = st.student_id AND sas.class_id = ss.class_id AND sas.subject_id = ss.subject_id
        LEFT JOIN student_exam_scores ses ON ses.student_id = st.student_id AND ses.class_id = ss.class_id AND ses.subject_id = ss.subject_id
      ),
      at_risk_subjects AS (
        SELECT
          student_id,
          student_name,
          class_name,
          course_name,
          level_name,
          subject_name,
          ROUND(final_grade::numeric, 1) as final_grade,
          ROUND((:minimumGrade - final_grade)::numeric, 1) as deficit
        FROM student_subject_performance
        WHERE (total_gradable_assignments + total_gradable_exams) > 0
          AND final_grade < :minimumGrade
      )
      SELECT
        student_id,
        student_name,
        class_name,
        course_name,
        level_name,
        json_agg(
          json_build_object(
            'subjectName', subject_name,
            'finalGrade', final_grade,
            'deficit', deficit
          ) ORDER BY final_grade ASC, subject_name ASC
        ) as subjects_at_risk
      FROM at_risk_subjects
      GROUP BY student_id, student_name, class_name, course_name, level_name
      ORDER BY student_name ASC
      LIMIT 50
      `,
      {
        schoolId,
        minimumGrade,
        algorithm: calculationAlgorithm,
        hasClassScope,
        scopedClassIds,
        academicPeriodId: academicPeriodId ?? null,
      }
    )

    return (result.rows as AtRiskByGradeRow[]).map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      className: row.class_name,
      courseName: row.course_name,
      levelName: row.level_name,
      minimumRequired: minimumGrade,
      subjectsAtRisk: (row.subjects_at_risk || []).map((subject) => ({
        subjectName: subject.subjectName,
        finalGrade: Number(subject.finalGrade),
        deficit: Number(subject.deficit),
      })),
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
