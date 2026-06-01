import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@adonisjs/inertia/react'
import type { Route } from '@tuyau/core/types'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Loader2,
  ChevronRight,
  ExternalLink,
  Download,
  FileImage,
  File,
  Printer,
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible'
import { cn } from '../../lib/utils'

import { api } from '~/lib/api'
import { brazilianDateFormatter, brazilianRealFormatter } from '../../lib/formatters'

interface MatriculaAxesContainerProps {
  matriculaId: string
}

type Tone = 'pending' | 'done' | 'attention' | 'na'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
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

function daysBetween(target: Date, from: Date = new Date()) {
  const ms = target.getTime() - from.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function relativeDeadlineLabel(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const days = daysBetween(d)
  const formatted = brazilianDateFormatter(d)
  if (days < 0)
    return {
      text: `Venceu há ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`,
      tone: 'attention' as Tone,
      formatted,
    }
  if (days === 0) return { text: 'Vence hoje', tone: 'attention' as Tone, formatted }
  if (days <= 7)
    return {
      text: `Faltam ${days} dia${days === 1 ? '' : 's'}`,
      tone: 'attention' as Tone,
      formatted,
    }
  return { text: `Faltam ${days} dias`, tone: 'pending' as Tone, formatted }
}

export function MatriculaAxesContainer({ matriculaId }: MatriculaAxesContainerProps) {
  const { data, isLoading, isError, error } = useQuery({
    ...api.api.v1.responsavel.api.enrollmentAxes.queryOptions({ params: { matriculaId } }),
    enabled: !!matriculaId,
  })

  if (isLoading) return <MatriculaAxesSkeleton />

  if (isError) {
    return (
      <section className="rounded-xl ring-1 ring-foreground/10 bg-card p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
        <h3 className="mt-3 text-base font-semibold">Não foi possível carregar sua matrícula</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
        </p>
      </section>
    )
  }

  if (!data) return <MatriculaAxesSkeleton />

  return <MatriculaAxesContent data={data} matriculaId={matriculaId} />
}

type AxesData = Route.Response<'api.v1.responsavel.api.enrollment_axes'>
type StudentDocumentsData = Route.Response<'api.v1.responsavel.api.student_documents'>
type DocsQuery = ReturnType<typeof useDocumentsQuery>

function useDocumentsQuery(studentId: string, enabled: boolean) {
  return useQuery({
    ...api.api.v1.responsavel.api.studentDocuments.queryOptions({ params: { studentId } }),
    enabled,
  })
}

function MatriculaAxesContent({ data, matriculaId }: { data: AxesData; matriculaId: string }) {
  const queryClient = useQueryClient()
  const { axes } = data
  const deadline = relativeDeadlineLabel(data.enrollmentDeadline)

  // Contagem de eixos concluídos pra render do progresso.
  // Assinatura sempre conta como etapa: quando NOT_APPLICABLE (sem provider
  // online), ainda há a assinatura presencial pendente que a escola agenda —
  // não é "etapa que não existe", é "etapa offline".
  const completeFlags: Array<{ key: string; done: boolean; applicable: boolean }> = [
    { key: 'docs', done: axes.docs.status === 'COMPLETE', applicable: axes.docs.required > 0 },
    { key: 'signature', done: axes.signature === 'COMPLETED', applicable: true },
    {
      key: 'payment',
      done: axes.payment === 'PAID',
      applicable: axes.payment !== 'NOT_APPLICABLE',
    },
    { key: 'classAllocation', done: axes.classAllocation === 'ALLOCATED', applicable: true },
  ]
  const applicable = completeFlags.filter((f) => f.applicable)
  const completed = applicable.filter((f) => f.done).length
  const total = applicable.length
  const isComplete = axes.isComplete

  // Documents query — só renderiza inline quando a seção Documentação for aberta
  // (mas pra simplificar, faço pre-fetch sempre, é leve)
  const documentsQuery = useDocumentsQuery(
    data.studentId,
    !!data.studentId && axes.docs.required > 0
  )

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {data.levelName ?? '-'}
              {data.academicPeriodName ? ` · ${data.academicPeriodName}` : ''}
            </p>
            <h2 className="text-lg font-semibold tracking-tight">{data.studentName ?? 'Aluno'}</h2>
          </div>
          {deadline && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Prazo de matrícula</p>
              <p
                className={cn(
                  'text-sm font-medium tabular-nums',
                  deadline.tone === 'attention' ? 'text-destructive' : 'text-foreground'
                )}
                title={deadline.formatted}
              >
                {deadline.text}
              </p>
            </div>
          )}
        </div>

        <ProgressBar completed={completed} total={total} isComplete={isComplete} />

        {isComplete && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch(`/api/v1/responsavel/matriculas/${data.id}/certificate`)
              if (!res.ok) {
                toast.error('Erro ao gerar comprovante')
                return
              }
              const cert = await res.json()
              const w = window.open('', '_blank')
              if (!w) return
              w.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Comprovante de Matrícula</title>
                  <style>
                    body { font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
                    h1 { font-size: 20px; margin-bottom: 4px; }
                    h2 { font-size: 14px; font-weight: normal; color: #666; margin-top: 0; }
                    .fields { margin: 24px 0; }
                    .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
                    .field-label { color: #666; }
                    .qr { text-align: center; margin: 32px 0; }
                    .qr img { width: 160px; height: 160px; }
                    .qr p { font-size: 11px; color: #999; margin-top: 8px; }
                    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
                    @media print { body { margin: 20px; } }
                  </style>
                </head>
                <body>
                  <h1>${cert.schoolName ?? 'Escola'}</h1>
                  <h2>Comprovante de Matrícula</h2>
                  <div class="fields">
                    <div class="field"><span class="field-label">Aluno</span><span>${cert.studentName}</span></div>
                    <div class="field"><span class="field-label">Série</span><span>${cert.levelName ?? '-'}</span></div>
                    <div class="field"><span class="field-label">Período</span><span>${cert.academicPeriodName ?? '-'}</span></div>
                    <div class="field"><span class="field-label">Status</span><span>Concluída</span></div>
                  </div>
                  <div class="qr">
                    <img src="${cert.qrCodeDataUrl}" alt="QR de verificação" />
                    <p>Escaneie pra verificar autenticidade</p>
                  </div>
                  <div class="footer">
                    Documento gerado em ${new Date().toLocaleDateString('pt-BR')} pelo sistema Anuá.<br/>
                    Verificação: ${cert.verificationUrl}
                  </div>
                </body>
                </html>
              `)
              w.document.close()
            }}
          >
            <Printer className="mr-2 h-3.5 w-3.5" />
            Comprovante de Matrícula
          </Button>
        )}
      </header>

      <div className="space-y-3">
        <AxisSection
          tone={toneFor('docs', axes)}
          title="Documentação"
          summary={docsSummary(axes)}
          sla="· análise em até 2 dias úteis"
          lastUpdatedAt={axes.docs.lastUpdatedAt}
          defaultOpen={axes.docs.status !== 'COMPLETE'}
          highlightNext={firstPendingKey(axes) === 'docs'}
        >
          <DocsContent
            studentId={data.studentId}
            queryClient={queryClient}
            query={documentsQuery}
          />
        </AxisSection>

        <AxisSection
          tone={toneFor('signature', axes)}
          title="Assinatura do contrato"
          summary={signatureSummary(axes)}
          sla="· escola entra em contato em até 3 dias úteis"
          lastUpdatedAt={axes.signatureLastUpdatedAt}
          defaultOpen={false}
          highlightNext={firstPendingKey(axes) === 'signature'}
        >
          <SignatureContent status={axes.signature} matriculaId={matriculaId} />
        </AxisSection>

        <AxisSection
          tone={toneFor('payment', axes)}
          title="Pagamento da taxa de matrícula"
          summary={paymentSummary(axes, data)}
          lastUpdatedAt={axes.paymentLastUpdatedAt}
          defaultOpen={axes.payment === 'PENDING' || axes.payment === 'OVERDUE'}
          highlightNext={firstPendingKey(axes) === 'payment'}
        >
          <PaymentContent data={data} />
        </AxisSection>

        <AxisSection
          tone={toneFor('classAllocation', axes)}
          title="Alocação de turma"
          summary={
            axes.classAllocation === 'ALLOCATED'
              ? `Turma ${data.allocatedClass?.name ?? 'definida'}`
              : 'Aguardando a escola'
          }
          sla="· definição até o início das aulas"
          lastUpdatedAt={axes.classAllocatedAt}
          defaultOpen={false}
          highlightNext={firstPendingKey(axes) === 'classAllocation'}
        >
          <ClassContent data={data} />
        </AxisSection>
      </div>
    </div>
  )
}

function firstPendingKey(axes: AxesData['axes']): string | null {
  if (axes.docs.required > 0 && axes.docs.status !== 'COMPLETE') return 'docs'
  if (axes.signature !== 'NOT_APPLICABLE' && axes.signature !== 'COMPLETED') return 'signature'
  if (axes.payment === 'PENDING' || axes.payment === 'OVERDUE') return 'payment'
  if (axes.classAllocation === 'PENDING') return 'classAllocation'
  return null
}

function toneFor(
  axis: 'docs' | 'signature' | 'payment' | 'classAllocation',
  axes: AxesData['axes']
): Tone {
  if (axis === 'docs') {
    if (axes.docs.status === 'COMPLETE') return 'done'
    if (axes.docs.status === 'REJECTED') return 'attention'
    if (axes.docs.required === 0) return 'na'
    return 'pending'
  }
  if (axis === 'signature') {
    if (axes.signature === 'COMPLETED') return 'done'
    if (axes.signature === 'DECLINED' || axes.signature === 'CANCELLED') return 'attention'
    // NOT_APPLICABLE = presencial pendente, ainda é uma etapa pra concluir
    return 'pending'
  }
  if (axis === 'payment') {
    if (axes.payment === 'NOT_APPLICABLE') return 'na'
    if (axes.payment === 'PAID') return 'done'
    if (axes.payment === 'OVERDUE') return 'attention'
    return 'pending'
  }
  if (axes.classAllocation === 'ALLOCATED') return 'done'
  return 'pending'
}

function docsSummary(axes: AxesData['axes']) {
  if (axes.docs.required === 0) return 'Sem documentos requeridos'
  if (axes.docs.status === 'COMPLETE')
    return `${axes.docs.approved} de ${axes.docs.required} aprovados`
  if (axes.docs.rejected > 0) {
    const r = axes.docs.rejected
    return `${r} rejeitado${r === 1 ? '' : 's'} · reenvie os arquivos`
  }
  return `${axes.docs.approved} de ${axes.docs.required} aprovados`
}

function signatureSummary(axes: AxesData['axes']) {
  switch (axes.signature) {
    // Hoje todo NOT_APPLICABLE significa "sem provider de assinatura online" —
    // a escola vai agendar a assinatura presencial. Quando ADR-0002 chegar
    // (provider online), passamos a diferenciar "contrato dispensa" de "será
    // presencial" e a copy aqui muda junto.
    case 'NOT_APPLICABLE':
      return 'Presencial · escola vai agendar'
    case 'COMPLETED':
      return 'Contrato assinado'
    case 'PARTIALLY_SIGNED':
      return 'Aguardando outros responsáveis'
    case 'DECLINED':
      return 'Assinatura recusada'
    case 'CANCELLED':
      return 'Assinatura cancelada'
    default:
      return 'Aguardando assinatura'
  }
}

function paymentSummary(axes: AxesData['axes'], data: AxesData) {
  if (axes.payment === 'NOT_APPLICABLE') return 'Sem taxa de matrícula'
  if (axes.payment === 'PAID') {
    const paid = data.enrollmentPayment?.paidAt
    return paid ? `Pago em ${brazilianDateFormatter(paid)}` : 'Pago'
  }
  if (axes.payment === 'OVERDUE') return 'Pagamento atrasado'
  if (data.enrollmentPayment?.totalAmount) {
    return brazilianRealFormatter(data.enrollmentPayment.totalAmount)
  }
  if (data.contract?.enrollmentValue) {
    return brazilianRealFormatter(data.contract.enrollmentValue)
  }
  return 'Aguardando geração da cobrança'
}

function formatRelativeTime(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'ontem'
  if (diffD < 30) return `há ${diffD} dias`
  return brazilianDateFormatter(d)
}

function AxisSection({
  tone,
  title,
  summary,
  sla,
  lastUpdatedAt,
  defaultOpen,
  highlightNext,
  children,
}: {
  tone: Tone
  title: string
  summary: string
  sla?: string
  lastUpdatedAt?: string | null
  defaultOpen: boolean
  highlightNext: boolean
  children: React.ReactNode
}) {
  const relTime = formatRelativeTime(lastUpdatedAt ?? null)

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <section
        className={cn(
          'group rounded-xl bg-card ring-1 ring-foreground/10 transition',
          highlightNext && 'ring-2 ring-primary/30'
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-xl'
            )}
          >
            <ToneIndicator tone={tone} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {summary}
                {tone === 'pending' && sla && <span className="ml-1.5 opacity-70">{sla}</span>}
              </p>
              {relTime && (
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Atualizado {relTime}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-90" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-4 py-3">{children}</div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

function ToneIndicator({ tone }: { tone: Tone }) {
  if (tone === 'done') {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-green-600/10 text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
      </span>
    )
  }
  if (tone === 'attention') {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-4 w-4" />
      </span>
    )
  }
  if (tone === 'na') {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground">
        <span className="text-[10px] font-semibold tracking-wide">N/A</span>
      </span>
    )
  }
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground">
      <Clock className="h-4 w-4" />
    </span>
  )
}

function ProgressBar({
  completed,
  total,
  isComplete,
}: {
  completed: number
  total: number
  isComplete: boolean
}) {
  const pct = total > 0 ? (completed / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {isComplete
            ? 'Matrícula concluída'
            : `${completed} de ${total} etapa${total === 1 ? '' : 's'} concluída${completed === 1 ? '' : 's'}`}
        </span>
        <span className="font-medium text-muted-foreground tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full transition-all duration-500',
            isComplete ? 'bg-green-600' : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function DocsContent({
  studentId,
  queryClient,
  query,
}: {
  studentId: string
  queryClient: ReturnType<typeof useQueryClient>
  query: DocsQuery
}) {
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
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.responsavel.api.enrollmentAxes.pathKey(),
      })
      toast.success('Arquivo enviado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao enviar arquivo')
    } finally {
      setUploadingId(null)
    }
  }

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }
  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar os documentos.{' '}
        <Link
          href="/responsavel/documentos"
          className="text-primary underline-offset-4 hover:underline"
        >
          Abrir página completa
        </Link>
      </p>
    )
  }

  const subs = query.data.submissions

  if (subs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum documento foi gerado pra essa matrícula ainda.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {subs.map((sub) => (
        <DocsRow
          key={sub.id}
          submission={sub}
          uploading={uploadingId === sub.id}
          onUpload={(f) => uploadFile(sub.id, f)}
        />
      ))}
      <div className="pt-1">
        <Link
          href="/responsavel/documentos"
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Ver todos os documentos
        </Link>
      </div>
    </div>
  )
}

type Submission = StudentDocumentsData['submissions'][number]

function DocsRow({
  submission,
  uploading,
  onUpload,
}: {
  submission: Submission
  uploading: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canUpload = submission.status !== 'APPROVED'
  const docName = submission.documentType?.name ?? 'Documento'
  const statusLabel =
    submission.status === 'APPROVED'
      ? 'Aprovado'
      : submission.status === 'REJECTED'
        ? 'Rejeitado'
        : submission.files.length > 0
          ? 'Em análise'
          : 'Pendente envio'
  const statusClass =
    submission.status === 'APPROVED'
      ? 'text-green-600 dark:text-green-400'
      : submission.status === 'REJECTED'
        ? 'text-destructive'
        : 'text-muted-foreground'

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{docName}</span>
            {submission.documentType?.isRequired && (
              <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                Obrigatório
              </span>
            )}
          </div>
          <p className={cn('text-xs mt-0.5', statusClass)}>{statusLabel}</p>
          {submission.status === 'REJECTED' && submission.rejectionReason && (
            <p className="mt-1 text-xs text-destructive">
              <span className="font-medium">Motivo: </span>
              {submission.rejectionReason}
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
              size="sm"
              variant={submission.status === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {submission.status === 'REJECTED'
                ? 'Reenviar'
                : submission.files.length > 0
                  ? 'Adicionar'
                  : 'Enviar'}
            </Button>
          </>
        )}
      </div>
      {submission.files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {submission.files.map((f) => {
            const FileIcon = getFileIcon(f.mimeType)
            return (
              <li
                key={f.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{f.fileName}</span>
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {formatFileSize(f.size)}
                  </span>
                </span>
                <a
                  href={f.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  title="Baixar arquivo"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SignatureContent({
  status,
  matriculaId,
}: {
  status: AxesData['axes']['signature']
  matriculaId: string
}) {
  if (status === 'NOT_APPLICABLE') {
    return (
      <p className="text-sm text-muted-foreground">
        A assinatura do contrato é presencial. A secretaria da escola vai entrar em contato pra
        agendar o melhor dia e horário.
      </p>
    )
  }
  if (status === 'COMPLETED') {
    return (
      <p className="text-sm text-muted-foreground">Contrato assinado por todos os responsáveis.</p>
    )
  }
  if (status === 'PARTIALLY_SIGNED') {
    return (
      <p className="text-sm text-muted-foreground">
        Você já assinou. Aguardando os demais responsáveis concluírem.
      </p>
    )
  }
  if (status === 'DECLINED' || status === 'CANCELLED') {
    return (
      <p className="text-sm text-destructive">
        A assinatura foi {status === 'DECLINED' ? 'recusada' : 'cancelada'}. Entre em contato com a
        secretaria pra reabrir o processo.
      </p>
    )
  }
  return <SignaturePendingActions matriculaId={matriculaId} />
}

function SignaturePendingActions({ matriculaId }: { matriculaId: string }) {
  const { data, isLoading, isError } = useQuery({
    ...api.api.v1.responsavel.api.enrollmentSignatureLink.queryOptions({
      params: { matriculaId },
    }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Buscando link de assinatura...
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Não conseguimos carregar o link agora. Tente recarregar a página em alguns segundos.
      </p>
    )
  }

  if (!data?.signatureLink) {
    return (
      <p className="text-sm text-muted-foreground">
        A escola vai enviar o contrato pra assinatura digital em breve. Você receberá um e-mail
        assim que estiver disponível.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Seu contrato está pronto pra assinatura digital.
      </p>
      <Button asChild className="gap-2">
        <a href={data.signatureLink} target="_blank" rel="noopener noreferrer">
          Assinar contrato
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    </div>
  )
}

function PaymentContent({ data }: { data: AxesData }) {
  const { axes, enrollmentPayment, contract } = data

  if (axes.payment === 'NOT_APPLICABLE') {
    return (
      <p className="text-sm text-muted-foreground">
        Este contrato não tem taxa de matrícula. Nada a pagar nesta etapa.
      </p>
    )
  }

  if (!enrollmentPayment) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          A cobrança ainda não foi gerada. Assim que estiver disponível, vai aparecer aqui.
        </p>
        {contract?.enrollmentValue ? (
          <p className="text-muted-foreground">
            Valor previsto:{' '}
            <strong className="text-foreground">
              {brazilianRealFormatter(contract.enrollmentValue)}
            </strong>
          </p>
        ) : null}
      </div>
    )
  }

  const value = enrollmentPayment.totalAmount ?? enrollmentPayment.amount
  const due = enrollmentPayment.dueDate ? brazilianDateFormatter(enrollmentPayment.dueDate) : null
  const daysToDue = enrollmentPayment.dueDate
    ? daysBetween(new Date(enrollmentPayment.dueDate))
    : null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>
          <p className="text-xs text-muted-foreground">Valor</p>
          <p className="text-base font-semibold tabular-nums">{brazilianRealFormatter(value)}</p>
        </div>
        {due && (
          <div>
            <p className="text-xs text-muted-foreground">Vencimento</p>
            <p
              className={cn(
                'text-sm font-medium tabular-nums',
                daysToDue !== null && daysToDue < 0 ? 'text-destructive' : 'text-foreground'
              )}
            >
              {due}
              {daysToDue !== null && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  (
                  {daysToDue < 0
                    ? `${Math.abs(daysToDue)} dia${Math.abs(daysToDue) === 1 ? '' : 's'} de atraso`
                    : daysToDue === 0
                      ? 'hoje'
                      : `em ${daysToDue} dia${daysToDue === 1 ? '' : 's'}`}
                  )
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {enrollmentPayment.invoiceUrl && axes.payment !== 'PAID' && (
          <Button asChild size="sm">
            <a href={enrollmentPayment.invoiceUrl} target="_blank" rel="noopener noreferrer">
              Pagar agora
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        )}
        <Button asChild variant="outline" size="sm">
          <Link href="/responsavel/mensalidades">Ver todas as cobranças</Link>
        </Button>
      </div>
    </div>
  )
}

function ClassContent({ data }: { data: AxesData }) {
  if (data.allocatedClass) {
    return (
      <p className="text-sm text-muted-foreground">
        Turma definida pela escola:{' '}
        <span className="font-medium text-foreground">{data.allocatedClass.name}</span>
      </p>
    )
  }
  return (
    <p className="text-sm text-muted-foreground">
      A escola ainda não alocou uma turma. Assim que a alocação for feita, o nome da turma vai
      aparecer aqui.
    </p>
  )
}

export function MatriculaAxesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
