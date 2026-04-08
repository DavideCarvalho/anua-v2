interface CourseHasAcademicPeriod {
  academicPeriodId?: string | null
}

interface LevelAssignedToCourseAcademicPeriod {
  courseHasAcademicPeriod?: CourseHasAcademicPeriod
}

export interface EnrollmentLike {
  id: string
  classId?: string | null
  academicPeriodId?: string | null
  levelAssignedToCourseAcademicPeriod?: LevelAssignedToCourseAcademicPeriod
  class?: {
    id: string
    name: string
  }
}

export interface StudentEnrollmentSource {
  classId?: string | null
  levels?: EnrollmentLike[]
}

export interface AcademicPeriodLike {
  id: string
  isActive?: boolean
}

export function getEnrollmentAcademicPeriodId(level: EnrollmentLike): string {
  return (
    level.levelAssignedToCourseAcademicPeriod?.courseHasAcademicPeriod?.academicPeriodId ||
    level.academicPeriodId ||
    ''
  )
}

export function pickCurrentEnrollment(
  student: StudentEnrollmentSource | null | undefined,
  academicPeriods: AcademicPeriodLike[]
): EnrollmentLike | null {
  if (!student?.levels?.length) return null

  const activePeriodIds = new Set(
    academicPeriods.filter((period) => period.isActive).map((period) => period.id)
  )

  const enrollmentInCurrentPeriod = student.levels.find((level) => {
    const periodId = getEnrollmentAcademicPeriodId(level)
    return periodId && activePeriodIds.has(periodId)
  })
  if (enrollmentInCurrentPeriod) return enrollmentInCurrentPeriod

  const enrollmentMatchingClass = student.levels.find(
    (level) => level.classId && level.classId === student.classId
  )
  if (enrollmentMatchingClass) return enrollmentMatchingClass

  return student.levels.find((level) => !!level.classId) || student.levels[0]
}
