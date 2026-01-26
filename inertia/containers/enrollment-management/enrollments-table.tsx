import { useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import {
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileX,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'

import { useEnrollmentsQueryOptions, type EnrollmentsResponse } from '../../hooks/queries/use_enrollments'
import { useUpdateDocumentStatusMutation } from '../../hooks/mutations/use_update_document_status'
import { brazilianDateFormatter } from '../../lib/formatters'

type Enrollment = EnrollmentsResponse['data'][number]
type StudentDocument = NonNullable<Enrollment['student']>['documents'][number]

const STATUS_OPTIONS = [
  { label: 'Pendente de Revisão', value: 'PENDING_DOCUMENT_REVIEW' },
  { label: 'Matriculado', value: 'REGISTERED' },
]

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  PENDING_DOCUMENT_REVIEW: 'Pendente de Revisão',
  REGISTERED: 'Matriculado',
}

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  PENDING_DOCUMENT_REVIEW: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  REGISTERED: 'border-green-200 bg-green-50 text-green-700',
}

const DOC_STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  APPROVED: 'border-green-200 bg-green-50 text-green-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
}

const DOC_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

function EnrollmentsErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar matrículas</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

interface EnrollmentsTableProps {
  schoolId: string
  academicPeriodId?: string
  levelId?: string
}

export function EnrollmentsTable({
  schoolId,
  academicPeriodId,
  levelId,
}: EnrollmentsTableProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <EnrollmentsErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <EnrollmentsTableContent
            schoolId={schoolId}
            academicPeriodId={academicPeriodId}
            levelId={levelId}
          />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function EnrollmentsTableContent({
  schoolId,
  academicPeriodId,
  levelId,
}: EnrollmentsTableProps) {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    status: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })

  const { status: statusFilter, page, limit } = filters

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string
    fileName: string
    action: 'APPROVED' | 'REJECTED'
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data, isLoading, error, refetch } = useQuery(
    useEnrollmentsQueryOptions({
      schoolId,
      academicPeriodId,
      levelId,
      status: statusFilter as any,
      page,
      limit,
    })
  )

  const updateDocumentMutation = useUpdateDocumentStatusMutation()

  const rows = data?.data || []
  const meta = data?.meta

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleApproveDocument = (docId: string, fileName: string) => {
    toast.promise(
      updateDocumentMutation.mutateAsync({
        id: docId,
        status: 'APPROVED',
      }),
      {
        loading: 'Aprovando documento...',
        success: `Documento "${fileName}" aprovado com sucesso!`,
        error: 'Erro ao aprovar documento',
      }
    )
  }

  const handleOpenRejectDialog = (docId: string, fileName: string) => {
    setSelectedDocument({ id: docId, fileName, action: 'REJECTED' })
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleRejectDocument = () => {
    if (!selectedDocument || !rejectionReason.trim()) return

    toast.promise(
      updateDocumentMutation.mutateAsync({
        id: selectedDocument.id,
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      }),
      {
        loading: 'Rejeitando documento...',
        success: `Documento "${selectedDocument.fileName}" rejeitado.`,
        error: 'Erro ao rejeitar documento',
      }
    )

    setRejectDialogOpen(false)
    setSelectedDocument(null)
    setRejectionReason('')
  }

  const getPendingDocsCount = (documents: StudentDocument[]) => {
    return documents.filter((d) => d.status === 'PENDING').length
  }

  const getApprovedDocsCount = (documents: StudentDocument[]) => {
    return documents.filter((d) => d.status === 'APPROVED').length
  }

  const getRejectedDocsCount = (documents: StudentDocument[]) => {
    return documents.filter((d) => d.status === 'REJECTED').length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Status da Matrícula</div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) =>
              setFilters({ status: value === 'all' ? null : value, page: 1 })
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          {rows.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma matrícula encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              {rows.map((enrollment: Enrollment) => (
                <Collapsible key={enrollment.id} asChild>
                  <TableBody>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(enrollment.id)}
                            >
                              {expandedRows.has(enrollment.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium">
                          {enrollment.student?.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {enrollment.student?.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {enrollment.level?.name || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {enrollment.academicPeriod?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {enrollment.student?.documents?.length > 0 ? (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge
                                        variant="outline"
                                        className="gap-1 border-green-200 bg-green-50 text-green-700"
                                      >
                                        <CheckCircle2 className="h-3 w-3" />
                                        {getApprovedDocsCount(enrollment.student.documents)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Aprovados</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge
                                        variant="outline"
                                        className="gap-1 border-yellow-200 bg-yellow-50 text-yellow-700"
                                      >
                                        <Clock className="h-3 w-3" />
                                        {getPendingDocsCount(enrollment.student.documents)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Pendentes</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {getRejectedDocsCount(enrollment.student.documents) > 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge
                                          variant="outline"
                                          className="gap-1 border-red-200 bg-red-50 text-red-700"
                                        >
                                          <XCircle className="h-3 w-3" />
                                          {getRejectedDocsCount(enrollment.student.documents)}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>Rejeitados</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Sem documentos
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ENROLLMENT_STATUS_COLORS[enrollment.student?.enrollmentStatus] ||
                              ''
                            }
                          >
                            {ENROLLMENT_STATUS_LABELS[enrollment.student?.enrollmentStatus] ||
                              enrollment.student?.enrollmentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {brazilianDateFormatter(enrollment.createdAt)}
                        </TableCell>
                      </TableRow>

                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/30 p-0">
                            <div className="p-4">
                              <h4 className="mb-3 text-sm font-semibold">
                                Documentos da Matrícula
                              </h4>
                              {enrollment.student?.documents?.length > 0 ? (
                                <div className="space-y-2">
                                  {enrollment.student.documents.map((doc: StudentDocument) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center justify-between rounded-lg border bg-background p-3"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div>
                                          <p className="text-sm font-medium">
                                            {doc.contractDocument?.name || doc.fileName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {doc.fileName}
                                          </p>
                                          {doc.rejectionReason && (
                                            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                              <AlertCircle className="h-3 w-3" />
                                              {doc.rejectionReason}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className={DOC_STATUS_COLORS[doc.status] || ''}
                                        >
                                          {DOC_STATUS_LABELS[doc.status] || doc.status}
                                        </Badge>

                                        {doc.status === 'PENDING' && (
                                          <>
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() =>
                                                      handleApproveDocument(doc.id, doc.fileName)
                                                    }
                                                    disabled={updateDocumentMutation.isPending}
                                                  >
                                                    <FileCheck className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Aprovar</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() =>
                                                      handleOpenRejectDialog(doc.id, doc.fileName)
                                                    }
                                                    disabled={updateDocumentMutation.isPending}
                                                  >
                                                    <FileX className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Rejeitar</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </>
                                        )}

                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                              >
                                                <a
                                                  href={`/api/v1/documents/${doc.id}/download`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </a>
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Visualizar</TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Nenhum documento enviado ainda.
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </TableBody>
                  </Collapsible>
                ))}
            </Table>
          )}

          {meta && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {meta.page} de {meta.lastPage} ({meta.total} matrículas)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setFilters({ page: meta.page - 1 })}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.lastPage}
                  onClick={() => setFilters({ page: meta.page + 1 })}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do documento "{selectedDocument?.fileName}".
              O responsável será notificado e poderá enviar um novo documento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motivo da Rejeição</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Ex: Documento ilegível, documento incorreto, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectDocument}
              disabled={!rejectionReason.trim() || updateDocumentMutation.isPending}
            >
              Rejeitar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
