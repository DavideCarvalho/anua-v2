import { useState, useRef, useEffect, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage, type ToolUIPart } from 'ai'
import { Streamdown } from 'streamdown'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, Send, User, Loader2, StopCircle, BrainCircuit } from 'lucide-react'
import { toolComponents } from './ai-components'
import { ToolStepGroup } from './ai-task'
import { AiChatEmpty, type ChatPersonaRole } from './ai-chat-empty'
import { AiChatInput } from './ai-chat-input'
import { AiActionApprovalCard } from './ai-action-approval-card'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { api } from '~/lib/api'

// Tools de escrita: renderizam como card de aprovação inline em vez do
// tool-step normal. Mantém em sync com WRITE_TOOL_NAMES no backend.
const ACTION_TOOL_NAMES: ReadonlySet<string> = new Set<string>([
  'sendCommunication',
  'justifyAbsence',
  'enterExamGrade',
])

type MessageBlock =
  | { kind: 'text'; text: string }
  | { kind: 'steps'; tools: ToolUIPart[] }
  | { kind: 'action'; tool: ToolUIPart }

function toolNameOf(part: ToolUIPart): string {
  return part.type.slice('tool-'.length)
}

function buildBlocks(parts: UIMessage['parts']): MessageBlock[] {
  const blocks: MessageBlock[] = []
  for (const part of parts) {
    if (part.type === 'text') {
      blocks.push({ kind: 'text', text: part.text })
      continue
    }
    if (!part.type.startsWith('tool-')) continue
    const toolPart = part as ToolUIPart
    if (ACTION_TOOL_NAMES.has(toolNameOf(toolPart))) {
      blocks.push({ kind: 'action', tool: toolPart })
      continue
    }
    const last = blocks[blocks.length - 1]
    if (last && last.kind === 'steps') {
      last.tools.push(toolPart)
    } else {
      blocks.push({ kind: 'steps', tools: [toolPart] })
    }
  }
  return blocks
}

type StoredToolCall = {
  toolCallId: string
  toolName: string
  input?: unknown
  args?: unknown
}
type StoredToolResult = {
  toolCallId: string
  toolName: string
  output?: unknown
  result?: unknown
}
type ThreadMessageRow = {
  id: string
  role: string
  content: string
  toolCalls: StoredToolCall[] | null
  toolResults: StoredToolResult[] | null
  createdAt: string
}

function rowsToUIMessages(rows: ThreadMessageRow[]): UIMessage[] {
  return rows
    .filter((m): m is ThreadMessageRow & { role: 'user' | 'assistant' } =>
      m.role === 'user' || m.role === 'assistant'
    )
    .map((m): UIMessage => {
      const parts: UIMessage['parts'] = []
      // Reconstruct tool parts (text + tool order is lost, so we put tools
      // before the closing text — matches the typical model output shape
      // and what the live stream rendered).
      const resultsByCall = new Map<string, StoredToolResult>()
      for (const r of m.toolResults ?? []) {
        resultsByCall.set(r.toolCallId, r)
      }
      for (const call of m.toolCalls ?? []) {
        const result = resultsByCall.get(call.toolCallId)
        parts.push({
          type: `tool-${call.toolName}`,
          toolCallId: call.toolCallId,
          state: result ? 'output-available' : 'input-available',
          input: call.input ?? call.args,
          output: result?.output ?? result?.result,
        } as ToolUIPart)
      }
      if (m.content) {
        parts.push({ type: 'text', text: m.content })
      }
      return { id: m.id, role: m.role, parts }
    })
}

type AiChatPaneProps = {
  threadId: string
  persona?: ChatPersonaRole
  isNewThread: boolean
  userName?: string
  // Fires once after the first turn of a draft thread is persisted server-
  // side. The parent uses this to flip from `/escola/ia` to
  // `/escola/ia/conversa/:id` only after the thread actually exists.
  onPersisted?: (threadId: string) => void
}

export function AiChatPane({
  threadId,
  persona = 'gestor',
  isNewThread,
  userName,
  onPersisted,
}: AiChatPaneProps) {
  const { data: threadDetail, isLoading } = useQuery({
    ...api.api.v1.ai.threads.show.queryOptions({ params: { id: threadId } }),
    enabled: !isNewThread,
  })

  // Once we've rendered ActiveChat for this AiChatPane instance, never
  // unmount it just because a later refetch is in-flight (e.g. after a
  // draft thread gets persisted and isNewThread flips). Unmounting would
  // throw away the live useChat session and its streamed messages.
  const hasRenderedRef = useRef(false)

  if (!isNewThread && isLoading && !hasRenderedRef.current) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        <ChatHeader title={null} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
  hasRenderedRef.current = true

  const messageRows = (threadDetail?.messages ?? []) as ThreadMessageRow[]
  const initialMessages = threadDetail ? rowsToUIMessages(messageRows) : []
  const headerTitle = threadDetail?.title ?? (isNewThread ? 'Nova conversa' : 'Conversa')

  return (
    <ActiveChat
      threadId={threadId}
      persona={persona}
      initialMessages={initialMessages}
      headerTitle={headerTitle}
      userName={userName}
      resume={!isNewThread}
      isNewThread={isNewThread}
      onPersisted={onPersisted}
    />
  )
}

type ActiveChatProps = {
  threadId: string
  persona: ChatPersonaRole
  initialMessages: UIMessage[]
  headerTitle: string
  userName?: string
  resume: boolean
  isNewThread: boolean
  onPersisted?: (threadId: string) => void
}

function ActiveChat({
  threadId,
  persona,
  initialMessages,
  headerTitle,
  userName,
  resume,
  isNewThread,
  onPersisted,
}: ActiveChatProps) {
  const queryClient = useQueryClient()

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/v1/ai/chat',
        body: { threadId, persona },
        credentials: 'include',
        prepareReconnectToStreamRequest: ({ id }) => ({
          api: `/api/v1/ai/chat/${id}/stream`,
          credentials: 'include',
        }),
      }),
    [threadId, persona]
  )

  const cancelMutation = useMutation(api.api.v1.ai.chat.cancel.mutationOptions())

  const { messages, sendMessage, status, error, stop, addToolOutput } = useChat({
    id: threadId,
    transport,
    messages: initialMessages,
    resume,
    onFinish: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: api.api.v1.ai.threads.list.queryOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: api.api.v1.ai.threads.show.queryOptions({ params: { id: threadId } })
            .queryKey,
        }),
      ])
      // Promote draft → persisted: parent flips URL to /conversa/:id only
      // after the server has actually written the row.
      if (isNewThread) {
        onPersisted?.(threadId)
      }
    },
  })

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isBusy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    setInput('')
    await sendMessage({ text: trimmed })
  }

  const showEmpty = messages.length === 0 && !isBusy

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ChatHeader title={headerTitle} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {showEmpty ? (
          <AiChatEmpty
            onPick={async (prompt) => {
              await submit(prompt)
            }}
            userName={userName}
            persona={persona}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
            {messages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                addToolOutput={addToolOutput}
              />
            ))}
            {isBusy && messages[messages.length - 1]?.role === 'user' && <ThinkingRow />}
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error.message}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-background px-5 py-3">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await submit(input)
          }}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <AiChatInput
            value={input}
            disabled={isBusy}
            onChange={setInput}
            onSubmit={async () => {
              await submit(input)
            }}
            autoFocusKey={threadId}
          />
          {isBusy ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={async () => {
                // Close the SSE on the client AND tell the server to abort
                // streamText — without the cancel call, the model keeps
                // generating tokens (and getting billed) until the run
                // finishes naturally.
                stop()
                await cancelMutation
                  .mutateAsync({ params: { threadId } })
                  .catch(() => {})
              }}
              className="h-10 w-10 shrink-0"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} className="h-10 w-10 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
        <p className="mx-auto mt-1.5 max-w-3xl text-center text-[10px] text-muted-foreground/70">
          A IA pode cometer erros. Confira informações importantes nos dados originais.
        </p>
      </footer>
    </div>
  )
}

function ChatHeader({ title }: { title: string | null }) {
  return (
    <header className="flex items-center gap-3 border-b border-border px-5 py-3.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <BrainCircuit className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-foreground">
          {title ?? 'Carregando…'}
        </h1>
        <p className="truncate text-[11px] text-muted-foreground">Assistente Anua</p>
      </div>
    </header>
  )
}

type AddToolOutputFn = ReturnType<typeof useChat>['addToolOutput']

function MessageRow({
  message,
  addToolOutput,
}: {
  message: UIMessage
  addToolOutput: AddToolOutputFn
}) {
  const isUser = message.role === 'user'
  const blocks = isUser ? null : buildBlocks(message.parts)

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] space-y-2 text-sm',
          isUser
            ? 'rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground'
            : 'text-foreground'
        )}
      >
        {isUser
          ? message.parts.map((part, idx) =>
              part.type === 'text' ? (
                <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {part.text}
                </p>
              ) : null
            )
          : blocks?.map((block, idx) => {
              if (block.kind === 'text') {
                return (
                  <div
                    key={idx}
                    className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
                  >
                    <Streamdown>{block.text}</Streamdown>
                  </div>
                )
              }
              if (block.kind === 'action') {
                return (
                  <AiActionApprovalCard
                    key={block.tool.toolCallId ?? idx}
                    toolCallId={block.tool.toolCallId}
                    toolName={toolNameOf(block.tool)}
                    input={block.tool.input}
                    state={block.tool.state}
                    output={
                      block.tool.state === 'output-available' ? block.tool.output : undefined
                    }
                    addToolOutput={addToolOutput}
                  />
                )
              }
              return <ToolBlock key={idx} tools={block.tools} />
            })}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

function ToolBlock({ tools }: { tools: ToolUIPart[] }) {
  return (
    <div className="space-y-2">
      <ToolStepGroup parts={tools} />
      {tools.map((tool, i) => {
        if (tool.state !== 'output-available') return null
        const toolName = toolNameOf(tool)
        const renderer = toolComponents[toolName]
        if (!renderer) return null
        return (
          <div key={tool.toolCallId ?? i}>
            {renderer({ input: tool.input, output: tool.output, state: tool.state })}
          </div>
        )
      })}
    </div>
  )
}

function ThinkingRow() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Pensando…
      </div>
    </div>
  )
}
