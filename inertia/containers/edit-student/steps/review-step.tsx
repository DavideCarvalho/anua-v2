import { useFormContext } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import type { EditStudentFormData } from '../../students/edit-student-modal/schema'

interface ReviewStepProps {
  onGoToStep: (step: number) => void
}

function formatDate(date: Date | undefined | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

function formatCpf(doc: string): string {
  const d = doc?.replace(/\D/g, '') || ''
  if (d.length !== 11) return doc || '—'
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function ReviewStep({ onGoToStep }: ReviewStepProps) {
  const form = useFormContext<EditStudentFormData>()
  const data = form.getValues()

  function EditLink({ step }: { step: number }) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(step)}>
        <Pencil className="h-3.5 w-3.5 mr-1" />
        Editar
      </Button>
    )
  }

  return (
    <div className="space-y-4 py-4">
      {/* Student Card */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Aluno</CardTitle>
          <EditLink step={0} />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nome:</span> {data.basicInfo.name}
          </p>
          <p>
            <span className="text-muted-foreground">Nascimento:</span>{' '}
            {formatDate(data.basicInfo.birthDate)}
          </p>
          {data.basicInfo.documentNumber && (
            <p>
              <span className="text-muted-foreground">Documento:</span>{' '}
              {data.basicInfo.documentType} — {formatCpf(data.basicInfo.documentNumber)}
            </p>
          )}
          {data.basicInfo.email && (
            <p>
              <span className="text-muted-foreground">Email:</span> {data.basicInfo.email}
            </p>
          )}
          {data.basicInfo.phone && (
            <p>
              <span className="text-muted-foreground">Telefone:</span> {data.basicInfo.phone}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Responsibles Card */}
      {!data.basicInfo.isSelfResponsible && data.responsibles.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Responsáveis</CardTitle>
            <EditLink step={1} />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.responsibles.map((resp, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-medium">{resp.name}</p>
                <p className="text-xs text-muted-foreground">
                  {resp.documentType}: {formatCpf(resp.documentNumber)}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {resp.isPedagogical && (
                    <Badge variant="secondary" className="text-xs">
                      Pedagógico
                    </Badge>
                  )}
                  {resp.isFinancial && (
                    <Badge variant="secondary" className="text-xs">
                      Financeiro
                    </Badge>
                  )}
                  {resp.isEmergencyContact && (
                    <Badge variant="outline" className="text-xs">
                      Emergência
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Address Card */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Endereço</CardTitle>
          <EditLink step={2} />
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            {data.address.street}, {data.address.number}
            {data.address.complement ? ` — ${data.address.complement}` : ''}
          </p>
          <p className="text-muted-foreground">
            {data.address.neighborhood} — {data.address.city}/{data.address.state} — CEP{' '}
            {data.address.zipCode}
          </p>
        </CardContent>
      </Card>

      {/* Medical Info Card */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Informações Médicas</CardTitle>
          <EditLink step={3} />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {data.medicalInfo.conditions ? (
            <p>
              <span className="text-muted-foreground">Condições:</span>{' '}
              {data.medicalInfo.conditions}
            </p>
          ) : (
            <p className="text-muted-foreground">Sem condições registradas</p>
          )}
          {data.medicalInfo.medications && data.medicalInfo.medications.length > 0 && (
            <p>
              <span className="text-muted-foreground">Medicamentos:</span>{' '}
              {data.medicalInfo.medications.length}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Contatos de emergência:</span>{' '}
            {data.medicalInfo.emergencyContacts.map((c) => c.name).join(', ') || '—'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
