import type { PropsWithChildren, ReactNode } from 'react'

type SimplifiedPageShellProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function SimplifiedPageShell({
  title,
  description,
  actions,
  children,
}: SimplifiedPageShellProps) {
  return (
    <section className="space-y-4">
      <div data-testid="simplified-page-header" className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      {actions ? (
        <div data-testid="simplified-primary-actions" className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}

      {children}
    </section>
  )
}
