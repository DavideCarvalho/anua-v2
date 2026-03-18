import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'

interface AtRiskByAttendanceStudent {
  studentId: string
  studentName: string
  className: string
  totalClasses: number
  absences: number
  absenceRate: number
  attendanceRate: number
}

interface AtRiskByAttendanceRow {
  student_id: string
  student_name: string
  class_name: string
  total_classes: string | number
  absences: string | number
  absence_rate: string | number
  attendance_rate: string | number
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
  teacherName: string
  daysPast: number
}

interface ExamWithoutGradeRow {
  exam_id: string
  exam_title: string
  examDate: string
  class_name: string
  teacher_name: string
  days_past: string | number
}

interface OverdueActivity {
  assignmentId: string
  assignmentName: string
  dueDate: string
  className: string
  teacherName: string
  daysPast: number
  totalStudents: number
  gradedStudents: number
}

interface OverdueActivityRow {
  assignment_id: string
  assignment_name: string
  dueDate: string
  class_name: string
  teacher_name: string
  days_past: string | number
  total_students: string | number
  graded_students: string | number
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

export default class GetPedagogicalAlertsController {
  async handle({ selectedSchoolIds }: HttpContext): Promise<{ alerts: PedagogicalAlerts }> {
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

    const [
      attendanceRiskStudents,
      gradeRiskStudents,
      examsWithoutGrades,
      overdueActivities,
      ungradedSubmissions,
      teachersMissingAttendance,
    ] = await Promise.all([
      this.getStudentsAtRiskByAttendance(schoolId, minimumAttendancePercentage),
      this.getStudentsAtRiskByGrade(schoolId, minimumGrade, calculationAlgorithm),
      this.getExamsWithoutGrades(schoolId),
      this.getOverdueActivities(schoolId),
      this.getUngradedSubmissions(schoolId),
      this.getTeachersMissingAttendance(schoolId, 7),
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
    minimumAttendancePercentage: number
  ): Promise<AtRiskByAttendanceStudent[]> {
    const result = await db.rawQuery(
      `
      WITH student_attendance AS (
        SELECT 
          st.id as student_id,
          u.name as student_name,
          c.name as class_name,
          COUNT(*) as total_classes,
          SUM(CASE WHEN sha.status = 'ABSENT' THEN 1 ELSE 0 END) as absences,
          SUM(CASE WHEN sha.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) as present
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "Class" c ON st."classId" = c.id
        JOIN "StudentHasAttendance" sha ON sha."studentId" = st.id
        WHERE c."schoolId" = :schoolId
        AND st."enrollmentStatus" = 'REGISTERED'
        GROUP BY st.id, u.name, c.name
        HAVING COUNT(*) >= 5
      )
      SELECT 
        student_id,
        student_name,
        class_name,
        total_classes,
        absences,
        ROUND((absences::float / total_classes * 100)::numeric, 1) as absence_rate,
        ROUND((present::float / total_classes * 100)::numeric, 1) as attendance_rate
      FROM student_attendance
      WHERE (absences::float / total_classes * 100) > :minAttendanceThreshold
      ORDER BY absence_rate DESC
      LIMIT 50
      `,
      { schoolId, minAttendanceThreshold: 100 - minimumAttendancePercentage }
    )

    return (result.rows as AtRiskByAttendanceRow[]).map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      className: row.class_name,
      totalClasses: Number(row.total_classes),
      absences: Number(row.absences),
      absenceRate: Number(row.absence_rate),
      attendanceRate: Number(row.attendance_rate),
    }))
  }

  private async getStudentsAtRiskByGrade(
    schoolId: string,
    minimumGrade: number,
    calculationAlgorithm: string
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
            ROUND(((COALESCE(assignment_avg, 0) + COALESCE(exam_avg, 0)) / 
                   NULLIF(graded_assignments + graded_exams, 0))::numeric, 1)
          WHEN :algorithm = 'SUM' THEN
            ROUND((COALESCE(assignment_avg, 0) * graded_assignments + 
                   COALESCE(exam_avg, 0) * graded_exams)::numeric, 1)
          ELSE ROUND(((COALESCE(assignment_avg, 0) + COALESCE(exam_avg, 0)) / 
                      NULLIF(graded_assignments + graded_exams, 0))::numeric, 1)
        END as final_grade
      FROM student_grades
      WHERE (
        CASE 
          WHEN :algorithm = 'AVERAGE' THEN 
            ((COALESCE(assignment_avg, 0) + COALESCE(exam_avg, 0)) / 
             NULLIF(graded_assignments + graded_exams, 0))
          WHEN :algorithm = 'SUM' THEN
            (COALESCE(assignment_avg, 0) * graded_assignments + 
             COALESCE(exam_avg, 0) * graded_exams)
          ELSE 
            ((COALESCE(assignment_avg, 0) + COALESCE(exam_avg, 0)) / 
             NULLIF(graded_assignments + graded_exams, 0))
        END
      ) < :minimumGrade
      ORDER BY final_grade ASC
      LIMIT 50
      `,
      { schoolId, minimumGrade, algorithm: calculationAlgorithm }
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

  private async getExamsWithoutGrades(schoolId: string): Promise<ExamWithoutGrade[]> {
    const result = await db.rawQuery(
      `
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        e."examDate",
        c.name as class_name,
        u.name as teacher_name,
        EXTRACT(DAY FROM NOW() - e."examDate") as days_past
      FROM exams e
      JOIN "Class" c ON e."classId" = c.id
      JOIN "User" u ON e."teacherId" = u.id
      WHERE e."schoolId" = :schoolId
      AND e."examDate" < NOW()
      AND NOT EXISTS (
        SELECT 1 FROM exam_grades eg 
        WHERE eg."examId" = e.id 
        AND eg.score IS NOT NULL
      )
      ORDER BY e."examDate" ASC
      LIMIT 50
      `,
      { schoolId }
    )

    return (result.rows as ExamWithoutGradeRow[]).map((row) => ({
      examId: row.exam_id,
      examTitle: row.exam_title,
      examDate: row.examDate,
      className: row.class_name,
      teacherName: row.teacher_name,
      daysPast: Math.round(Number(row.days_past)),
    }))
  }

  private async getOverdueActivities(schoolId: string): Promise<OverdueActivity[]> {
    const result = await db.rawQuery(
      `
      SELECT 
        a.id as assignment_id,
        a.name as assignment_name,
        a."dueDate",
        c.name as class_name,
        u.name as teacher_name,
        COUNT(sha.id) as total_students,
        COUNT(CASE WHEN sha.grade IS NOT NULL AND sha.grade > 0 THEN 1 END) as graded_students,
        EXTRACT(DAY FROM NOW() - a."dueDate") as days_past
      FROM "Assignment" a
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "User" u ON thc."teacherId" = u.id
      LEFT JOIN "StudentHasAssignment" sha ON sha."assignmentId" = a.id
      WHERE c."schoolId" = :schoolId
      AND a."dueDate" < NOW()
      AND a.grade IS NOT NULL
      AND a.grade > 0
      GROUP BY a.id, a.name, a."dueDate", c.name, u.name
      HAVING COUNT(sha.id) = 0 
         OR COUNT(CASE WHEN sha.grade IS NOT NULL AND sha.grade > 0 THEN 1 END) < COUNT(sha.id)
      ORDER BY a."dueDate" ASC
      LIMIT 50
      `,
      { schoolId }
    )

    return (result.rows as OverdueActivityRow[]).map((row) => ({
      assignmentId: row.assignment_id,
      assignmentName: row.assignment_name,
      dueDate: row.dueDate,
      className: row.class_name,
      teacherName: row.teacher_name,
      daysPast: Math.round(Number(row.days_past)),
      totalStudents: Number(row.total_students),
      gradedStudents: Number(row.graded_students),
    }))
  }

  private async getUngradedSubmissions(schoolId: string): Promise<UngradedSubmission[]> {
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
      AND sha.grade IS NULL
      AND a.grade IS NOT NULL
      AND a.grade > 0
      ORDER BY sha."createdAt" ASC
      LIMIT 50
      `,
      { schoolId }
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
    daysThreshold: number
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
      { schoolId, daysThreshold }
    )

    return (result.rows as TeacherMissingAttendanceRow[]).map((row) => ({
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      classes: row.classes || [],
      daysWithoutAttendance: Math.round(Number(row.days_without_attendance)),
      neverRegistered: row.never_registered,
    }))
  }
}
