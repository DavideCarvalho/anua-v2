import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  File,
  FileImage,
  FileArchive,
} from 'lucide-react'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'

import {
  useStudentDocumentsQueryOptions,
  type StudentDocumentsResponse,
} from '../../hooks/queries/use_student_documents'
import { brazilianDateFormatter } from '../../lib/formatters'

type MissingDocument = StudentDocumentsResponse['missingDocuments'][number]
type StudentDocument = StudentDocumentsResponse['documents'][number]

interface StudentDocumentsContainerProps {
  studentId: string
  studentName: string
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendente',
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
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.includes('zip') || mimeType.includes('rar')) return FileArchive
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StudentDocumentsContainer({
  studentId,
  studentName,
}: StudentDocumentsContainerProps) {
  const { data, isLoading, isError, error } = useQuery(useStudentDocumentsQueryOptions(studentId))

  if (isLoading) {
    return <StudentDocumentsContainerSkeleton />
  }

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

  if (!data) {
    return <StudentDocumentsContainerSkeleton />
  }

  const hasDocuments = data.documents.length > 0
  const hasMissingRequired = data.summary.requiredMissing > 0

  return (
    <div className="space-y-6">
      {/* Alert for missing required documents */}
      {hasMissingRequired && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Documentos pendentes</AlertTitle>
          <AlertDescription>
            Existem {data.summary.requiredMissing} documento
            {data.summary.requiredMissing > 1 ? 's obrigatorios' : ' obrigatorio'} pendente
            {data.summary.requiredMissing > 1 ? 's' : ''} de envio.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.total}</p>
                <p className="text-sm text-muted-foreground">Total enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.pending}</p>
                <p className="text-sm text-muted-foreground">Em analise</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.approved}</p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Documents */}
      {data.missingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Documentos Pendentes de Envio
            </CardTitle>
            <CardDescription>
              Estes documentos ainda precisam ser enviados para a escola
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
                          Obrigatorio
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

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos de {studentName}
          </CardTitle>
          <CardDescription>
            {hasDocuments
              ? `${data.documents.length} documento${data.documents.length > 1 ? 's' : ''} enviado${data.documents.length > 1 ? 's' : ''}`
              : 'Nenhum documento enviado ainda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasDocuments ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum documento</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ainda não foram enviados documentos para este aluno.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.documents.map((doc: StudentDocument) => {
                const statusConfig = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = statusConfig?.icon || Clock
                const FileIcon = getFileIcon(doc.mimeType)

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{doc.documentType.name}</span>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusConfig?.className)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig?.label || doc.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doc.fileName} - {formatFileSize(doc.size)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviado em {brazilianDateFormatter(String(doc.createdAt))}
                        </p>
                        {doc.status === 'REJECTED' && doc.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Motivo da rejeicao:</strong> {doc.rejectionReason}
                          </div>
                        )}
                        {doc.reviewedAt && doc.reviewerName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Revisado por {doc.reviewerName} em{' '}
                            {brazilianDateFormatter(String(doc.reviewedAt))}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </a>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
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
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
