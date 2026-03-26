'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Settings } from 'lucide-react'

export interface ScheduleConfig {
  startTime: string
  classesPerDay: number
  classDuration: number
  breakAfterClass: number
  breakDuration: number
}

interface ScheduleConfigFormProps {
  value: ScheduleConfig
  onChange: (next: ScheduleConfig) => void
  onApply: () => void
  onCancel?: () => void
}

export function ScheduleConfigForm({
  value,
  onChange,
  onApply,
  onCancel,
}: ScheduleConfigFormProps) {
  const handleChange = (field: keyof ScheduleConfig, nextValue: string | number) => {
    onChange({ ...value, [field]: nextValue })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração da Grade
        </CardTitle>
        <CardDescription>
          Configure o template de horários e aplique as alterações para continuar.
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
                value={value.startTime}
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
                value={value.classesPerDay}
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
                value={value.classDuration}
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
                max={value.classesPerDay}
                value={value.breakAfterClass}
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
                value={value.breakDuration}
                onChange={(e) => handleChange('breakDuration', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Apply button */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button onClick={onApply} size="lg">
              Aplicar Configuração
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
