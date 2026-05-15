import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Paperclip, FileText, ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { api } from '~/lib/api'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const MAX_FILES = 5
const MAX_SIZE_BYTES = 5 * 1024 * 1024

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface AttendanceAttachmentsSectionProps {
  studentHasAttendanceId: string
}

export function AttendanceAttachmentsSection({
  studentHasAttendanceId,
}: AttendanceAttachmentsSectionProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const listQuery = useQuery(
    api.api.v1.attendance.attachments.index.queryOptions({
      params: { id: studentHasAttendanceId },
    })
  )

  const attachments = listQuery.data?.attachments ?? []
  const remaining = MAX_FILES - attachments.length

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(
        `/api/v1/attendance/${studentHasAttendanceId}/attachments/${attachmentId}`,
        { method: 'DELETE', credentials: 'include' }
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.message || 'Falha ao remover anexo')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.attendance.attachments.index.pathKey(),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  async function uploadOne(file: File) {
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`Tipo não permitido: ${file.name}`)
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`Arquivo muito grande: ${file.name} (máx 5MB)`)
    }
    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch(`/api/v1/attendance/${studentHasAttendanceId}/attachments`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      body: fd,
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.message || `Falha ao enviar ${file.name}`)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const picked = Array.from(files).slice(0, remaining)
    if (picked.length === 0) {
      toast.error(`Limite de ${MAX_FILES} anexos por registro atingido`)
      return
    }

    setUploading(true)
    try {
      for (const file of picked) {
        await uploadOne(file)
      }
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.attendance.attachments.index.pathKey(),
      })
      toast.success(picked.length > 1 ? 'Anexos enviados' : 'Anexo enviado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar anexo'
      toast.error(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Anexos{' '}
          <span className="font-normal">
            ({attachments.length}/{MAX_FILES})
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs"
          disabled={uploading || remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Paperclip className="h-3 w-3" />
          )}
          Adicionar
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {listQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Carregando anexos
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Envie atestado, recibo ou outro comprovante (imagem ou PDF, até 5 MB).
        </p>
      ) : (
        <ul className="space-y-1">
          {attachments.map((att) => {
            const isImage = att.mimeType.startsWith('image/')
            return (
              <li
                key={att.id}
                className={cn(
                  'flex items-center gap-2 rounded-md border border-border/70 bg-background px-2 py-1.5 text-xs'
                )}
              >
                {isImage ? (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={att.fileUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-medium hover:underline"
                  >
                    {att.fileName}
                  </a>
                  <p className="text-[10px] text-muted-foreground">
                    {humanSize(att.fileSizeBytes)}
                    {att.uploadedBy ? ` · ${att.uploadedBy.name}` : ''}
                    {att.createdAt
                      ? ` · há ${formatDistanceToNow(new Date(att.createdAt), { locale: ptBR })}`
                      : ''}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${att.fileName}`}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(att.id)}
                >
                  {deleteMutation.isPending && deleteMutation.variables === att.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
