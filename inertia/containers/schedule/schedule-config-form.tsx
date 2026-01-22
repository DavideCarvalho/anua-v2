'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Settings, Wand2 } from 'lucide-react'

interface ScheduleConfig {
  startTime: string
  classesPerDay: number
  classDuration: number
  breakAfterClass: number
  breakDuration: number
}

interface GeneratedSlot {
  classWeekDay: number
  startTime: string
  endTime: string
  minutes: number
  isBreak: boolean
  teacherHasClassId: string | null
  teacherHasClass: {
    id: string
    teacher: { id: string; user: { name: string } }
    subject: { id: string; name: string }
  } | null
}

interface UnscheduledClass {
  id: string
  subjectQuantity: number
  remainingLessons: number
  teacher: { id: string; user: { name: string } }
  subject: { id: string; name: string }
}

interface GenerateResult {
  calendar: { id: string; name: string; isActive: boolean }
  slots: GeneratedSlot[]
  unscheduled: UnscheduledClass[]
}

interface ScheduleConfigFormProps {
  classId: string
  academicPeriodId: string
  onGenerate: (result: GenerateResult) => void
}

async function generateSchedule(
  classId: string,
  academicPeriodId: string,
  config: ScheduleConfig
): Promise<GenerateResult> {
  const response = await fetch(`/api/v1/schedules/class/${classId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ academicPeriodId, config }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao gerar grade')
  }

  return response.json()
}

export function ScheduleConfigForm({
  classId,
  academicPeriodId,
  onGenerate,
}: ScheduleConfigFormProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    startTime: '07:30',
    classesPerDay: 6,
    classDuration: 50,
    breakAfterClass: 3,
    breakDuration: 20,
  })

  const generateMutation = useMutation({
    mutationFn: () => generateSchedule(classId, academicPeriodId, config),
    onSuccess: (result) => {
      if (result.unscheduled.length > 0) {
        toast.warning(
          `Grade gerada com ${result.unscheduled.length} aula(s) não alocada(s). Arraste-as para os horários disponíveis.`
        )
      } else {
        toast.success('Grade gerada com sucesso!')
      }
      onGenerate(result)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleChange = (field: keyof ScheduleConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração da Grade
        </CardTitle>
        <CardDescription>
          Configure o template de horários e clique em "Gerar Grade" para distribuir
          automaticamente as aulas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Row 1: Start time, classes per day, duration */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Início</Label>
              <Input
                id="startTime"
                type="time"
                value={config.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classesPerDay">Aulas por Dia</Label>
              <Input
                id="classesPerDay"
                type="number"
                min={1}
                max={10}
                value={config.classesPerDay}
                onChange={(e) => handleChange('classesPerDay', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classDuration">Duração da Aula (min)</Label>
              <Input
                id="classDuration"
                type="number"
                min={30}
                max={60}
                value={config.classDuration}
                onChange={(e) => handleChange('classDuration', parseInt(e.target.value) || 50)}
              />
            </div>
          </div>

          {/* Row 2: Break config */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="breakAfterClass">Intervalo após a aula nº</Label>
              <Input
                id="breakAfterClass"
                type="number"
                min={1}
                max={config.classesPerDay}
                value={config.breakAfterClass}
                onChange={(e) => handleChange('breakAfterClass', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakDuration">Duração do Intervalo (min)</Label>
              <Input
                id="breakDuration"
                type="number"
                min={0}
                max={60}
                value={config.breakDuration}
                onChange={(e) => handleChange('breakDuration', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Generate button */}
          <div className="flex justify-end">
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="lg"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {generateMutation.isPending ? 'Gerando...' : 'Gerar Grade'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
