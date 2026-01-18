import { useMemo, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

import { useTeachersTimesheetQueryOptions } from '../../hooks/queries/use-teachers-timesheet'
import { useAcademicPeriodsQueryOptions } from '../../hooks/queries/use-academic-periods'

export function TeacherTimesheetTable({
  onViewAbsences,
}: {
  onViewAbsences: (teacherId: string, month: number, year: number) => void
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [selectedAcademicPeriodIds, setSelectedAcademicPeriodIds] = useState<string[]>([])

  const { data: activeAcademicPeriods } = useSuspenseQuery(
    useAcademicPeriodsQueryOptions({ page: 1, limit: 50 })
  )

  const periods = useMemo(() => {
    if (Array.isArray(activeAcademicPeriods)) return activeAcademicPeriods
    return activeAcademicPeriods?.data ?? []
  }, [activeAcademicPeriods])

  const { data: timesheet } = useSuspenseQuery(
    useTeachersTimesheetQueryOptions({
      month: selectedMonth,
      year: selectedYear,
      academicPeriodIds: selectedAcademicPeriodIds.length
        ? selectedAcademicPeriodIds
        : [periods[0]?.id].filter(Boolean),
    } as any)
  )

  const rows = Array.isArray(timesheet) ? timesheet : (timesheet ?? [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Período Letivo</div>
          <Select
            value={selectedAcademicPeriodIds[0]}
            onValueChange={(value) => setSelectedAcademicPeriodIds(value ? [value] : [])}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Ano</div>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Mês</div>
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {String(m).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">Total de Aulas</th>
                  <th className="text-left p-3 font-medium">Total de Faltas</th>
                  <th className="text-right p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3 font-medium">{row.User?.name ?? 'Professor'}</td>
                    <td className="p-3 text-muted-foreground">{row.totalClasses ?? 0}</td>
                    <td className="p-3 text-muted-foreground">{row.totalAbsences ?? 0}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAbsences(row.id, selectedMonth, selectedYear)}
                      >
                        Ver Faltas
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
