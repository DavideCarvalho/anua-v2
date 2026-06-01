import { useQuery } from '@tanstack/react-query'
import { Link } from '@adonisjs/inertia/react'
import {
  PenLine,
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Settings,
} from 'lucide-react'

import { Skeleton } from '../../components/ui/skeleton'
import { cn } from '../../lib/utils'

import { api } from '~/lib/api'

interface Props {
  schoolId: string
  academicPeriodId?: string
}

type ActionItem = {
  key: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  title: (count: number) => string
  helper: string
  cta?: { label: string; href: string }
}

export function EnrollmentActionRequiredBanner({ schoolId, academicPeriodId }: Props) {
  const { data, isLoading, isError } = useQuery(
    api.api.v1.enrollments.actionCounts.queryOptions({
      query: { schoolId, academicPeriodId },
    })
  )

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />
  }

  if (isError || !data) {
    // Banner é informativo, falha silenciosa não atrapalha o resto da página.
    return null
  }

  const items: ActionItem[] = [
    {
      key: 'signature',
      count: data.counts.needsOfflineSignature,
      icon: PenLine,
      title: (n: number) =>
        n === 1
          ? 'matrícula esperando agendar a assinatura presencial'
          : 'matrículas esperando agendar a assinatura presencial',
      helper: 'Documentos aprovados. Entre em contato com o responsável pra marcar a assinatura.',
    },
    {
      key: 'class',
      count: data.counts.needsClassAllocation,
      icon: Users,
      title: (n: number) =>
        n === 1
          ? 'matrícula sem turma alocada há mais de 3 dias'
          : 'matrículas sem turma alocada há mais de 3 dias',
      helper: 'Defina a turma pra liberar o acesso do aluno no portal.',
    },
    {
      key: 'payment-setup',
      count: data.counts.needsManualPaymentCollection,
      icon: CreditCard,
      title: (n: number) =>
        n === 1
          ? 'matrícula com taxa pendente que você precisa cobrar manualmente'
          : 'matrículas com taxa pendente que você precisa cobrar manualmente',
      helper: 'Configure um gateway de pagamento online pra gerar cobranças automáticas.',
      cta: { label: 'Configurar pagamento', href: '/escola/configuracoes' },
    },
    {
      key: 'docs',
      count: data.counts.waitingDocumentResubmit,
      icon: FileText,
      title: (n: number) =>
        n === 1
          ? 'matrícula com documento rejeitado aguardando reenvio'
          : 'matrículas com documentos rejeitados aguardando reenvio',
      helper: 'O responsável foi avisado. Você pode acompanhar o status pela tabela abaixo.',
    },
  ].filter((item) => item.count > 0)

  if (items.length === 0) {
    return (
      <section className="rounded-xl ring-1 ring-foreground/10 bg-card px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Tudo em dia.</span> Nenhuma matrícula
          esperando ação da escola no momento.
        </p>
      </section>
    )
  }

  const showsPaymentSetupHint =
    !data.hasOnlinePayment && data.counts.needsManualPaymentCollection > 0

  return (
    <section className="rounded-xl ring-1 ring-foreground/10 bg-card overflow-hidden">
      <header className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Ação requerida</p>
          <p className="text-xs text-muted-foreground">
            {items.length === 1
              ? '1 pendência precisa de atenção da escola'
              : `${items.length} pendências precisam de atenção da escola`}
          </p>
        </div>
        {showsPaymentSetupHint && (
          <Link
            href="/escola/configuracoes"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-primary font-medium underline-offset-2 hover:underline"
          >
            <Settings className="h-3 w-3" />
            Pagamento ainda não configurado
          </Link>
        )}
      </header>

      <ul className="divide-y divide-border">
        {items.map((item) => (
          <ActionRow key={item.key} item={item} />
        ))}
      </ul>
    </section>
  )
}

function ActionRow({ item }: { item: ActionItem }) {
  const Icon = item.icon
  return (
    <li className="px-4 py-3 flex items-start gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold tabular-nums text-primary">{item.count}</span>{' '}
          {item.title(item.count)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.helper}</p>
      </div>
      {item.cta && (
        <Link
          href={item.cta.href}
          className={cn(
            'shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary',
            'underline-offset-2 hover:underline'
          )}
        >
          {item.cta.label}
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </li>
  )
}
