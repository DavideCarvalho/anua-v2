import { useQuery } from '@tanstack/react-query'

export type StudentStatus =
  | 'APPROVED'
  | 'AT_RISK_GRADE'
  | 'AT_RISK_ATTENDANCE'
  | 'FAILED'
  | 'IN_PROGRESS'

export interface StudentStatusData {
  id: string
  name: string
  status: StudentStatus
  finalGrade: number
  maxPossibleGrade: number
  attendancePercentage: number
  pointsUntilPass: number | null
  classesUntilFail: number | null
  missedAssignments: { id: string; name: string; dueDate: string }[]
}

interface UseStudentStatusOptions {
  classId: string
  courseId: string
  academicPeriodId: string
  subjectId: string | null
  enabled?: boolean
}

async function fetchStudentStatus(
  classId: string,
  courseId: string,
  academicPeriodId: string,
  subjectId: string
): Promise<StudentStatusData[]> {
  const response = await fetch(
    `/api/v1/classes/${classId}/student-status?subjectId=${subjectId}&courseId=${courseId}&academicPeriodId=${academicPeriodId}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch student status')
  }
  return response.json()
}

export function useStudentStatus({
  classId,
  courseId,
  academicPeriodId,
  subjectId,
  enabled = true,
}: UseStudentStatusOptions) {
  return useQuery({
    queryKey: ['student-status', classId, courseId, academicPeriodId, subjectId],
    queryFn: () => fetchStudentStatus(classId, courseId, academicPeriodId, subjectId!),
    enabled: enabled && !!classId && !!courseId && !!academicPeriodId && !!subjectId,
  })
}
