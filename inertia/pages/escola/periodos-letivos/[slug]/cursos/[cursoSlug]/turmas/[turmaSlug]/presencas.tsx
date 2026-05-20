import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { AttendancesTable, LessonsTable, NewAttendanceModal } from '../../../../../../../../containers/turma'
import { SubPeriodFilter } from '../../../../../../../../containers/academic-periods/components/sub-period-filter'
import { api } from '~/lib/api'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
  classId: string
  academicPeriodId: string
  courseId: string
  className: string
  courseName: string
  academicPeriodName: string
}

type View = 'students' | 'lessons'

export default function TurmaPresencasPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  academicPeriodId,
  courseId,
  className,
  courseName,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [subPeriodId, setSubPeriodId] = useState('')
  const [view, setView] = useState<View>('students')

  const { data: subPeriodsResponse } = useQuery({
    ...api.api.v1.academicSubPeriods.index.queryOptions({ query: { academicPeriodId } }),
    enabled: !!academicPeriodId,
  })

  const subPeriodIsLocked = useMemo(() => {
    if (!subPeriodId) return false
    const list = subPeriodsResponse?.data ?? []
    const found = list.find((sp) => sp.id === subPeriodId)
    return !!found?.isLocked
  }, [subPeriodsResponse, subPeriodId])

  return (
    <TurmaLayout
      turmaName={className}
      courseName={courseName}
      academicPeriodSlug={academicPeriodSlug}
      courseSlug={courseSlug}
      classSlug={classSlug}
      screenId="escola_turma_presencas"
      classId={classId}
      courseId={courseId}
      academicPeriodId={academicPeriodId}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Lista de Presenças</CardTitle>
              <CardDescription>
                Acompanhe e corrija a frequência dos alunos nas aulas
              </CardDescription>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar presença
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SubPeriodFilter
              academicPeriodId={academicPeriodId}
              value={subPeriodId}
              onChange={setSubPeriodId}
            />
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <TabsList className="h-8">
                <TabsTrigger value="students" className="h-7 px-3 text-xs">
                  Por aluno
                </TabsTrigger>
                <TabsTrigger value="lessons" className="h-7 px-3 text-xs">
                  Por aula
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {view === 'students' ? (
            <AttendancesTable
              classId={classId}
              academicPeriodId={academicPeriodId}
              courseId={courseId}
              subPeriodId={subPeriodId}
              subPeriodIsLocked={subPeriodIsLocked}
            />
          ) : (
            <LessonsTable
              classId={classId}
              academicPeriodId={academicPeriodId}
              subPeriodId={subPeriodId}
              subPeriodIsLocked={subPeriodIsLocked}
            />
          )}
        </CardContent>
      </Card>

      <NewAttendanceModal
        classId={classId}
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </TurmaLayout>
  )
}
