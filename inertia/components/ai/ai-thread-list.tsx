import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'
import { api } from '~/lib/api'


function formatRelative(iso: string | { toISO?: () => string | null }): string {
  const raw = typeof iso === 'string' ? iso : iso.toISO?.() ?? ''
  if (!raw) return ''
  const then = new Date(raw).getTime()
  const minutes = Math.floor((Date.now() - then) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(raw).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

type AiThreadListProps = {
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export function AiThreadList({ selectedId, onSelect, onNew }: AiThreadListProps) {
  const queryClient = useQueryClient()
  const threadsQuery = api.api.v1.ai.threads.list.queryOptions()
  const { data: threads, isLoading } = useQuery(threadsQuery)
  const { mutationFn } = api.api.v1.ai.threads.delete.mutationOptions()
  const deleteMutation = useMutation({
    mutationFn,
    onMutate: async ({ params }: { params: { id: string } }) => {
      // Stop in-flight refetches so they don't overwrite our optimistic state
      // mid-flight with the pre-delete server snapshot.
      await queryClient.cancelQueries({ queryKey: threadsQuery.queryKey })
      const previous = queryClient.getQueryData(threadsQuery.queryKey)
      queryClient.setQueryData(threadsQuery.queryKey, (old) =>
        (old ?? []).filter((t) => t.id !== params.id)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(threadsQuery.queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: threadsQuery.queryKey })
    },
  })
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  function handleDelete(id: string) {
    setPendingDelete(null)
    if (id === selectedId) onNew()
    // Fire-and-await without blocking the UI — the optimistic update already
    // removed the row from the list; if the server fails, onError rolls back.
    deleteMutation.mutate({ params: { id } })
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-muted/30">
      <div className="border-b border-border px-3 py-3">
        <Button onClick={onNew} variant="default" className="w-full justify-start gap-2 h-9">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Nova conversa</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 py-2">
          {isLoading ? (
            <ThreadListSkeleton />
          ) : !threads?.length ? (
            <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">
                Nenhuma conversa ainda. Comece pelo botão acima.
              </p>
            </div>
          ) : (
            <ol className="space-y-0.5">
              <AnimatePresence initial={false}>
                {threads.map((thread) => {
                  const isSelected = thread.id === selectedId
                  const isPendingDel = pendingDelete === thread.id
                  return (
                    <motion.li
                      key={thread.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{
                        opacity: 0,
                        x: -16,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                      }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          'group flex items-center gap-1 rounded-md transition-colors',
                          isSelected ? 'bg-primary/10' : 'hover:bg-accent/60'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(thread.id)}
                          className={cn(
                            'flex-1 truncate rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                            isSelected ? 'text-foreground font-medium' : 'text-foreground/80'
                          )}
                        >
                          <span className="block truncate">
                            {thread.title ?? 'Nova conversa'}
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">
                            {formatRelative(thread.updatedAt)}
                          </span>
                        </button>
                        {isPendingDel ? (
                          <div className="flex items-center gap-0.5 pr-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(thread.id)}
                              className="h-6 px-2 text-[10px]"
                            >
                              Excluir
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingDelete(null)}
                              className="h-6 px-2 text-[10px]"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPendingDelete(thread.id)
                            }}
                            className={cn(
                              'mr-1 rounded p-1 text-muted-foreground/70 transition-opacity',
                              'opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10',
                              isSelected && 'opacity-100'
                            )}
                            aria-label="Excluir conversa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ol>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

function ThreadListSkeleton() {
  const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-3/5', 'w-2/3', 'w-1/2']
  return (
    <ol className="space-y-0.5">
      {widths.map((w, i) => (
        <li
          key={i}
          className="flex flex-col gap-1.5 rounded-md px-2.5 py-2"
          style={{ animation: `pulse 1.6s ease-in-out ${i * 80}ms infinite` }}
        >
          <span className={cn('block h-3.5 rounded-sm bg-muted-foreground/15', w)} />
          <span className="block h-2 w-10 rounded-sm bg-muted-foreground/10" />
        </li>
      ))}
    </ol>
  )
}
