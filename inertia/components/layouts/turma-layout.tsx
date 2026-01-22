import { Link, usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'
import type { SharedProps } from '../../lib/types'

interface TurmaLayoutProps extends PropsWithChildren {
  turmaName: string
  courseName: string
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
}

const tabs = [
  { label: 'Atividades', path: 'atividades' },
  { label: 'Provas', path: 'provas' },
  { label: 'Presenças', path: 'presencas' },
  { label: 'Notas', path: 'notas' },
  { label: 'Situação', path: 'situacao' },
]

export function TurmaLayout({
  children,
  turmaName,
  courseName,
  academicPeriodSlug,
  courseSlug,
  classSlug,
}: TurmaLayoutProps) {
  const { url } = usePage<SharedProps>()
  const pathname = url.split('?')[0]
  const baseUrl = `/escola/periodos-letivos/${academicPeriodSlug}/cursos/${courseSlug}/turmas/${classSlug}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{turmaName}</h1>
        <p className="text-muted-foreground">{courseName}</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const tabUrl = `${baseUrl}/${tab.path}`
            const isActive = pathname === tabUrl

            return (
              <Link
                key={tab.path}
                href={tabUrl}
                className={cn(
                  'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
