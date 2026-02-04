import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { EmailInput } from '~/components/forms/email-input'
import type { EnrollmentFormData } from '../schema'
import { DocumentTypeLabels } from '../schema'
import type { DocumentType } from '../schema'

type Guardian = EnrollmentFormData['responsibles'][number]

interface GuardianCardProps {
  guardian: Guardian
  onRemove: () => void
  onUpdate?: (data: Partial<Omit<Guardian, 'documentType' | 'documentNumber'>>) => void
  existingEmails?: string[]
  academicPeriodId?: string
}

function formatCpf(doc: string) {
  const d = doc.replace(/\D/g, '')
  if (d.length !== 11) return doc
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatDateForInput(date: Date | undefined | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function GuardianCard({ guardian, onRemove, onUpdate, existingEmails = [], academicPeriodId }: GuardianCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(guardian.name)
  const [email, setEmail] = useState(guardian.email)
  const [phone, setPhone] = useState(guardian.phone)
  const [birthDate, setBirthDate] = useState(formatDateForInput(guardian.birthDate))
  const [isPedagogical, setIsPedagogical] = useState(guardian.isPedagogical)
  const [isFinancial, setIsFinancial] = useState(guardian.isFinancial)
  const [isEmergencyContact, setIsEmergencyContact] = useState(guardian.isEmergencyContact)
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null)

  const isEmailDuplicate = email.trim().toLowerCase() !== '' && existingEmails.includes(email.trim().toLowerCase())

  const formattedDocument =
    guardian.documentType === 'CPF' ? formatCpf(guardian.documentNumber) : guardian.documentNumber

  function handleSave() {
    onUpdate?.({
      name,
      email,
      phone,
      birthDate: birthDate ? new Date(birthDate) : guardian.birthDate,
      isPedagogical,
      isFinancial,
      isEmergencyContact,
    })
    setIsEditing(false)
  }

  function handleCancel() {
    setName(guardian.name)
    setEmail(guardian.email)
    setPhone(guardian.phone)
    setBirthDate(formatDateForInput(guardian.birthDate))
    setIsPedagogical(guardian.isPedagogical)
    setIsFinancial(guardian.isFinancial)
    setIsEmergencyContact(guardian.isEmergencyContact)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`edit-name-${guardian.documentNumber}`}>Nome *</Label>
              <Input
                id={`edit-name-${guardian.documentNumber}`}
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-birthdate-${guardian.documentNumber}`}>Data de Nascimento *</Label>
              <Input
                id={`edit-birthdate-${guardian.documentNumber}`}
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-email-${guardian.documentNumber}`}>Email *</Label>
              <EmailInput
                value={email}
                onChange={setEmail}
                academicPeriodId={academicPeriodId}
                excludeUserId={(guardian as any).id}
                onValidationChange={setIsEmailValid}
              />
              {isEmailDuplicate && (
                <p className="text-sm text-destructive">Este email já está sendo usado por outro responsável</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-phone-${guardian.documentNumber}`}>Telefone *</Label>
              <Input
                id={`edit-phone-${guardian.documentNumber}`}
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Documento</Label>
              <Input value={`${DocumentTypeLabels[guardian.documentType as DocumentType] ?? guardian.documentType}: ${formattedDocument}`} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Funções do Responsável</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isPedagogical}
                  onCheckedChange={(checked) => setIsPedagogical(checked === true)}
                />
                Pedagógico
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isFinancial}
                  onCheckedChange={(checked) => setIsFinancial(checked === true)}
                />
                Financeiro
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isEmergencyContact}
                  onCheckedChange={(checked) => setIsEmergencyContact(checked === true)}
                />
                Contato de Emergência
              </label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={!name.trim() || !email || !phone || !birthDate || isEmailDuplicate || isEmailValid === false}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">{guardian.name}</p>
          <p className="text-xs text-muted-foreground">
            {DocumentTypeLabels[guardian.documentType as DocumentType] ?? guardian.documentType}: {formattedDocument}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {guardian.isPedagogical && (
              <Badge variant="secondary" className="text-xs">
                Pedagógico
              </Badge>
            )}
            {guardian.isFinancial && (
              <Badge variant="secondary" className="text-xs">
                Financeiro
              </Badge>
            )}
            {guardian.isEmergencyContact && (
              <Badge variant="outline" className="text-xs">
                Emergência
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onUpdate && (
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
