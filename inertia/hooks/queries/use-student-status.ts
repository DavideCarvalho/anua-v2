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
  subjectId: string | null
  enabled?: boolean
}

async function fetchStudentStatus(
  classId: string,
  subjectId: string
): Promise<StudentStatusData[]> {
  const response = await fetch(
    `/api/v1/classes/${classId}/student-status?subjectId=${subjectId}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch student status')
  }
  return response.json()
}

export function useStudentStatus({ classId, subjectId, enabled = true }: UseStudentStatusOptions) {
  return useQuery({
    queryKey: ['student-status', classId, subjectId],
    queryFn: () => fetchStudentStatus(classId, subjectId!),
    enabled: enabled && !!classId && !!subjectId,
  })
}
