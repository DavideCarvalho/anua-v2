import { useState } from 'react'
import { Loader2, Search, UserCheck, UserPlus } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Card, CardContent } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'
import { tuyau } from '~/lib/api'
import type { InferResponseType } from '@tuyau/client'
import { EmailInput } from '~/components/forms/email-input'
import type { EnrollmentFormData } from '../schema'
import { DocumentType, DocumentTypeLabels } from '../schema'

interface GuardianCpfLookupProps {
  schoolId: string
  onConfirm: (guardian: EnrollmentFormData['responsibles'][number]) => void
  onCancel: () => void
  existingDocuments: string[]
  existingEmails: string[]
  academicPeriodId?: string
}

const _lookupRoute = tuyau.api.v1.students['lookup-responsible']
type LookupResult = InferResponseType<typeof _lookupRoute.$get>

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function getDocPlaceholder(type: (typeof DocumentType)[number]) {
  switch (type) {
    case 'CPF': return '000.000.000-00'
    case 'RG': return 'Número do RG'
    case 'PASSPORT': return 'Número do passaporte'
  }
}

function cleanDocument(value: string, type: (typeof DocumentType)[number]) {
  if (type === 'PASSPORT') return value.trim()
  return value.replace(/\D/g, '')
}

function formatDocument(value: string, type: (typeof DocumentType)[number]) {
  if (type === 'CPF') return formatCpf(value)
  return value
}

export function GuardianCpfLookup({
  schoolId,
  onConfirm,
  onCancel,
  existingDocuments,
  existingEmails,
  academicPeriodId,
}: GuardianCpfLookupProps) {
  // Document type + search state
  const [documentType, setDocumentType] = useState<(typeof DocumentType)[number]>('CPF')
  const [documentInput, setDocumentInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [foundResponsible, setFoundResponsible] = useState<LookupResult | null>(null)

  // Role checkboxes
  const [isPedagogical, setIsPedagogical] = useState(false)
  const [isFinancial, setIsFinancial] = useState(false)
  const [isEmergencyContact, setIsEmergencyContact] = useState(true)

  // New guardian form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null)

  const cleanedDoc = cleanDocument(documentInput, documentType)
  const isDuplicate = existingDocuments.includes(cleanedDoc)
  const canSearch =
    !isDuplicate &&
    (documentType === 'CPF' ? cleanedDoc.length === 11 : cleanedDoc.length >= 1)
  const isEmailDuplicate = email.trim().toLowerCase() !== '' && existingEmails.includes(email.trim().toLowerCase())

  function handleDocumentTypeChange(val: string) {
    setDocumentType(val as (typeof DocumentType)[number])
    setDocumentInput('')
    setSearched(false)
    setFoundResponsible(null)
  }

  function handleDocumentInputChange(value: string) {
    if (documentType === 'CPF') {
      setDocumentInput(formatCpf(value))
    } else {
      setDocumentInput(value)
    }
    setSearched(false)
    setFoundResponsible(null)
  }

  async function handleSearch() {
    if (!canSearch) return
    setIsSearching(true)
    try {
      const data = await tuyau.api.v1.students['lookup-responsible'].$get({ query: { documentNumber: cleanedDoc, schoolId } }).unwrap()
      setFoundResponsible(data)
      setSearched(true)
    } catch {
      setFoundResponsible(null)
      setSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  function handleConfirmExisting() {
    if (!foundResponsible) return
    onConfirm({
      id: foundResponsible.id,
      name: foundResponsible.name,
      email: foundResponsible.email ?? '',
      phone: foundResponsible.phone ?? '',
      documentType: (foundResponsible.documentType ?? documentType) as (typeof DocumentType)[number],
      documentNumber: foundResponsible.documentNumber ?? cleanedDoc,
      birthDate: foundResponsible.birthDate ? new Date(foundResponsible.birthDate) : new Date(),
      isPedagogical,
      isFinancial,
      isEmergencyContact,
      isExisting: true,
    })
  }

  function handleConfirmNew() {
    if (!name.trim()) return
    onConfirm({
      name,
      email,
      phone,
      documentType,
      documentNumber: cleanedDoc,
      birthDate: birthDate ? new Date(birthDate) : new Date(),
      isPedagogical,
      isFinancial,
      isEmergencyContact,
      isExisting: false,
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* Document type selector */}
        <div className="space-y-2">
          <Label>Tipo de Documento</Label>
          <Select value={documentType} onValueChange={handleDocumentTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DocumentType.map((dt) => (
                <SelectItem key={dt} value={dt}>
                  {DocumentTypeLabels[dt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document number input + search */}
        <div className="space-y-2">
          <Label htmlFor="doc-lookup">{DocumentTypeLabels[documentType]} do Responsável</Label>
          <div className="flex gap-2">
            <Input
              id="doc-lookup"
              placeholder={getDocPlaceholder(documentType)}
              value={documentInput}
              onChange={(e) => handleDocumentInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSearch}
              disabled={!canSearch || isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Buscar</span>
            </Button>
          </div>
          {isDuplicate && (
            <p className="text-sm text-destructive">Este documento já foi adicionado</p>
          )}
        </div>

        {/* Found: Read-only card */}
        {searched && foundResponsible && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Responsável encontrado</span>
            </div>

            <div className={cn('rounded-lg bg-muted/50 p-4 space-y-2')}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{foundResponsible.name}</p>
                <Badge variant="secondary" className="text-xs">
                  Existente
                </Badge>
              </div>
              {foundResponsible.email && (
                <p className="text-xs text-muted-foreground">
                  Email: {foundResponsible.email}
                </p>
              )}
              {foundResponsible.phone && (
                <p className="text-xs text-muted-foreground">
                  Telefone: {foundResponsible.phone}
                </p>
              )}
            </div>

            <RoleCheckboxes
              isPedagogical={isPedagogical}
              isFinancial={isFinancial}
              isEmergencyContact={isEmergencyContact}
              onPedagogicalChange={setIsPedagogical}
              onFinancialChange={setIsFinancial}
              onEmergencyContactChange={setIsEmergencyContact}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmExisting}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Not found: Full form */}
        {searched && !foundResponsible && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Novo responsável</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="guardian-name">Nome *</Label>
                <Input
                  id="guardian-name"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian-birthdate">Data de Nascimento *</Label>
                <Input
                  id="guardian-birthdate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian-email">Email *</Label>
                <EmailInput
                  value={email}
                  onChange={setEmail}
                  academicPeriodId={academicPeriodId}
                  onValidationChange={setIsEmailValid}
                />
                {isEmailDuplicate && (
                  <p className="text-sm text-destructive">Este email já está sendo usado por outro responsável</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian-phone">Telefone *</Label>
                <Input
                  id="guardian-phone"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Documento</Label>
                <Input value={`${DocumentTypeLabels[documentType]}: ${formatDocument(cleanedDoc, documentType)}`} disabled />
              </div>
            </div>

            <RoleCheckboxes
              isPedagogical={isPedagogical}
              isFinancial={isFinancial}
              isEmergencyContact={isEmergencyContact}
              onPedagogicalChange={setIsPedagogical}
              onFinancialChange={setIsFinancial}
              onEmergencyContactChange={setIsEmergencyContact}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmNew} disabled={!name.trim() || !email || !phone || !birthDate || isEmailDuplicate || isEmailValid === false}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Initial state: just cancel button */}
        {!searched && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RoleCheckboxes({
  isPedagogical,
  isFinancial,
  isEmergencyContact,
  onPedagogicalChange,
  onFinancialChange,
  onEmergencyContactChange,
}: {
  isPedagogical: boolean
  isFinancial: boolean
  isEmergencyContact: boolean
  onPedagogicalChange: (checked: boolean) => void
  onFinancialChange: (checked: boolean) => void
  onEmergencyContactChange: (checked: boolean) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Funções do Responsável</Label>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isPedagogical}
            onCheckedChange={(checked) => onPedagogicalChange(checked === true)}
          />
          Pedagógico
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isFinancial}
            onCheckedChange={(checked) => onFinancialChange(checked === true)}
          />
          Financeiro
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isEmergencyContact}
            onCheckedChange={(checked) => onEmergencyContactChange(checked === true)}
          />
          Contato de Emergência
        </label>
      </div>
    </div>
  )
}
