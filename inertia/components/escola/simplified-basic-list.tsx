import type { PropsWithChildren } from 'react'

type SimplifiedBasicListProps = PropsWithChildren<{
  className?: string
}>

export function SimplifiedBasicList({ children, className }: SimplifiedBasicListProps) {
  return (
    <div data-testid="simplified-basic-list" className={`rounded-xl border bg-card ${className ?? ''}`}>
      <div className="p-4">{children}</div>
    </div>
  )
}
