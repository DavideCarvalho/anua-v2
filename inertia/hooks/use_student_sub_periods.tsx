import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { api } from '~/lib/api'
import { SubPeriodFilter } from '~/containers/academic-periods/components/sub-period-filter'

interface StudentAcademicPeriod {
  id: string
  name: string
}

export function useStudentSubPeriods(studentId: string | undefined) {
  const [subPeriodId, setSubPeriodId] = useState('')

  const { data: periodsData } = useQuery({
    ...api.api.v1.responsavel.api.studentAcademicPeriods.queryOptions({
      params: { studentId: studentId! },
    }),
    enabled: !!studentId,
  })

  const academicPeriod = (periodsData?.data ?? [])[0] as StudentAcademicPeriod | undefined
  const academicPeriodId = academicPeriod?.id ?? null

  const subPeriodFilter =
    academicPeriodId && studentId ? (
      <SubPeriodFilter
        academicPeriodId={academicPeriodId}
        value={subPeriodId}
        onChange={setSubPeriodId}
      />
    ) : null

  return { academicPeriodId, subPeriodId, setSubPeriodId, subPeriodFilter }
}
