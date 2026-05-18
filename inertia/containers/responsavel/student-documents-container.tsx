import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  File,
  FileImage,
  Upload,
  Loader2,
} from 'lucide-react'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'

import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'
import { brazilianDateFormatter } from '../../lib/formatters'

type StudentDocumentsResponse = Route.Response<'api.v1.responsavel.api.student_documents'>
type Submission = StudentDocumentsResponse['submissions'][number]
type SubmissionFile = Submission['files'][number]
type MissingDocument = StudentDocumentsResponse['missingDocuments'][number]

interface StudentDocumentsContainerProps {
  studentId: string
  studentName: string
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Em análise',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  APPROVED: {
    label: 'Aprovado',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  REJECTED: {
    label: 'Rejeitado',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
} as const

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]
const MAX_SIZE_BYTES = 5 * 1024 * 1024

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage
  return File
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StudentDocumentsContainer({
  studentId,
  studentName,
}: StudentDocumentsContainerProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    ...api.api.v1.responsavel.api.studentDocuments.queryOptions({ params: { studentId } }),
    enabled: !!studentId,
  })

  // Estado de upload por submission — permite spinner localizado em vez de
  // bloquear a tela inteira
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  async function uploadFile(submissionId: string, file: File) {
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error(`Tipo não permitido: ${file.name}`)
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Arquivo muito grande: ${file.name} (máx 5MB)`)
      return
    }

    setUploadingId(submissionId)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(
        `/api/v1/responsavel/students/${studentId}/submissions/${submissionId}/files`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          body: fd,
        }
      )

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.message || 'Falha ao enviar arquivo')
      }

      await queryClient.invalidateQueries({
        queryKey: api.api.v1.responsavel.api.studentDocuments.pathKey(),
      })
      toast.success('Arquivo enviado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao enviar arquivo')
    } finally {
      setUploadingId(null)
    }
  }

  if (isLoading) return <StudentDocumentsContainerSkeleton />

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar documentos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return <StudentDocumentsContainerSkeleton />

  const hasSubmissions = data.submissions.length > 0
  const hasMissingRequired = data.summary.requiredMissing > 0
  const rejectedCount = data.summary.rejected

  return (
    <div className="space-y-6">
      {rejectedCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {rejectedCount === 1
              ? 'Um documento foi rejeitado'
              : `${rejectedCount} documentos foram rejeitados`}
          </AlertTitle>
          <AlertDescription>
            Confira o motivo de cada um abaixo e reenvie os arquivos solicitados.
          </AlertDescription>
        </Alert>
      )}

      {hasMissingRequired && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Documentos obrigatórios pendentes</AlertTitle>
          <AlertDescription>
            Faltam {data.summary.requiredMissing} documento
            {data.summary.requiredMissing > 1 ? 's' : ''} obrigatório
            {data.summary.requiredMissing > 1 ? 's' : ''} de envio.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          tone="bg-blue-100"
          value={data.summary.total}
          label="Submissões"
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          tone="bg-yellow-100"
          value={data.summary.pending}
          label="Em análise"
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          tone="bg-green-100"
          value={data.summary.approved}
          label="Aprovados"
        />
        <SummaryCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          tone="bg-red-100"
          value={data.summary.rejected}
          label="Rejeitados"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos de {studentName}
          </CardTitle>
          <CardDescription>
            {hasSubmissions
              ? `${data.submissions.length} documento${data.submissions.length > 1 ? 's' : ''} sendo acompanhado${data.submissions.length > 1 ? 's' : ''}`
              : 'Nenhum documento ainda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSubmissions ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {data.submissions.map((sub: Submission) => (
                <SubmissionRow
                  key={sub.id}
                  submission={sub}
                  uploading={uploadingId === sub.id}
                  onUpload={(file) => uploadFile(sub.id, file)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data.missingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Outros documentos do contrato
            </CardTitle>
            <CardDescription>
              Estes documentos estão definidos no contrato mas ainda não foram criados pra envio.
              Contate a escola se precisar enviá-los.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.missingDocuments.map((doc: MissingDocument) => (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center justify-between p-4 border rounded-lg',
                    doc.isRequired && 'border-yellow-200 bg-yellow-50'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doc.name}</span>
                      {doc.isRequired && (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SummaryCard({
  icon,
  tone,
  value,
  label,
}: {
  icon: React.ReactNode
  tone: string
  value: number
  label: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhum documento</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Ainda não foi criado nenhum documento pra acompanhar.
      </p>
    </div>
  )
}

function SubmissionRow({
  submission,
  uploading,
  onUpload,
}: {
  submission: Submission
  uploading: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const statusConfig = STATUS_CONFIG[submission.status as keyof typeof STATUS_CONFIG]
  const StatusIcon = statusConfig?.icon ?? Clock
  const canUpload = submission.status !== 'APPROVED'
  const docName = submission.documentType?.name ?? 'Documento'

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{docName}</span>
            <Badge variant="outline" className={cn('text-xs', statusConfig?.className)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig?.label ?? submission.status}
            </Badge>
            {submission.documentType?.isRequired && (
              <Badge variant="outline" className="text-xs">
                Obrigatório
              </Badge>
            )}
          </div>
          {submission.documentType?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {submission.documentType.description}
            </p>
          )}
        </div>

        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_MIME.join(',')}
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onUpload(f)
                if (inputRef.current) inputRef.current.value = ''
              }}
            />
            <Button
              variant={submission.status === 'REJECTED' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              {submission.status === 'REJECTED'
                ? 'Reenviar'
                : submission.files.length > 0
                  ? 'Adicionar arquivo'
                  : 'Enviar arquivo'}
            </Button>
          </>
        )}
      </div>

      {submission.status === 'REJECTED' && submission.rejectionReason && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Motivo:</strong> {submission.rejectionReason}
        </div>
      )}

      {submission.files.length > 0 && (
        <div className="space-y-2">
          {submission.files.map((f: SubmissionFile) => {
            const FileIcon = getFileIcon(f.mimeType)
            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 p-2 bg-muted/40 rounded"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{f.fileName}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(f.size)}</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {(submission.reviewedAt || submission.submittedAt) && (
        <p className="text-xs text-muted-foreground">
          {submission.submittedAt &&
            `Enviado em ${brazilianDateFormatter(String(submission.submittedAt))}`}
          {submission.reviewedAt && submission.reviewerName && (
            <>
              {' · '}
              Revisado por {submission.reviewerName} em{' '}
              {brazilianDateFormatter(String(submission.reviewedAt))}
            </>
          )}
        </p>
      )}
    </div>
  )
}

export function StudentDocumentsContainerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-20 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
