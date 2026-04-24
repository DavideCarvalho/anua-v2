import { Head } from '@inertiajs/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Bell, MessageSquare, Calendar, Paperclip, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { FilePreviewLightbox, type PreviewFile } from '../../components/ui/file-preview-lightbox'

type AnnouncementItem = {
  id: string
  title: string
  body: string
  createdAt: string
  publishedAt: string | null
  attachments?: Array<{ id: string; fileName: string; fileUrl?: string | null; mimeType?: string | null }>
  requiresAcknowledgement?: boolean
  acknowledgementDueAt?: string | null
  acknowledgementStatus?: 'NOT_REQUIRED' | 'PENDING_ACK' | 'ACKNOWLEDGED' | 'EXPIRED_UNACKNOWLEDGED'
}

type AnnouncementResponse = {
  data: AnnouncementItem[]
}

async function listComunicados(): Promise<AnnouncementResponse> {
  const response = await fetch('/api/v1/responsavel/comunicados?limit=20', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar comunicados')
  }

  return response.json()
}

function ComunicadosContent() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['responsavel-comunicados'],
    queryFn: listComunicados,
  })

  const acknowledgeMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await fetch(
        `/api/v1/responsavel/comunicados/${announcementId}/acknowledge`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao registrar ciência')
      }

      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['responsavel-comunicados'] })
      await queryClient.invalidateQueries({ queryKey: ['responsavel-pending-ack'] })
    },
  })

  if (isLoading) {
    return <ComunicadosSkeleton />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar comunicados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const announcements = data?.data ?? []
  const hasPreview = previewFiles.length > 0

  const openPreview = (attachments: PreviewFile[], index: number) => {
    setPreviewFiles(attachments)
    setPreviewIndex(index < 0 ? 0 : index)
    setPreviewOpen(true)
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum comunicado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não possui comunicados ou notificações.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{announcement.title}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Comunicado
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {(announcement.publishedAt ?? announcement.createdAt)
                ? format(
                    new Date(announcement.publishedAt ?? announcement.createdAt),
                    "dd 'de' MMMM 'de' yyyy, HH:mm",
                    {
                      locale: ptBR,
                    }
                  )
                : 'Data indisponível'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{announcement.body}</p>

            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Anexos</p>
                <div className="space-y-1.5">
                  {announcement.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-sm" title={attachment.fileName}>
                          {attachment.fileName}
                        </span>
                      </div>

                      {attachment.fileUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            const files = (announcement.attachments ?? []).map((item) => ({
                              id: item.id,
                              fileName: item.fileName,
                              fileUrl: item.fileUrl,
                              mimeType: item.mimeType,
                            }))
                            const selectedIndex = files.findIndex((item) => item.id === attachment.id)
                            openPreview(files, selectedIndex)
                          }}
                          className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Abrir
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Arquivo indisponivel
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs">
                {announcement.acknowledgementStatus === 'ACKNOWLEDGED' && 'Ciente confirmado'}
                {announcement.acknowledgementStatus === 'PENDING_ACK' && 'Aguardando ciência'}
                {announcement.acknowledgementStatus === 'EXPIRED_UNACKNOWLEDGED' &&
                  'Ciência expirada'}
                {(announcement.acknowledgementStatus === 'NOT_REQUIRED' ||
                  !announcement.acknowledgementStatus) &&
                  'Ciência não exigida'}
              </Badge>

              {announcement.acknowledgementStatus === 'PENDING_ACK' && (
                <button
                  className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
                  onClick={() => acknowledgeMutation.mutate(announcement.id)}
                  disabled={acknowledgeMutation.isPending}
                >
                  Li e estou ciente
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {hasPreview && (
        <FilePreviewLightbox
          files={previewFiles}
          initialIndex={previewIndex}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  )
}

function ComunicadosSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-12 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ComunicadosPage() {
  return (
    <ResponsavelLayout>
      <Head title="Comunicados" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Comunicados
          </h1>
          <p className="text-muted-foreground">Comunicados oficiais enviados pela escola</p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar comunicados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <ComunicadosContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
