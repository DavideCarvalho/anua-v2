export function AttentionInboxSkeleton() {
  return (
    <div className="space-y-1" aria-busy="true" aria-live="polite">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-3 py-3 -mx-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted animate-pulse" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-3/5 rounded bg-muted animate-pulse" />
            <div className="h-3 w-2/5 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
