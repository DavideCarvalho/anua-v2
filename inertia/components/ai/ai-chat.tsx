import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, AlertCircle, Loader2, BrainCircuit } from 'lucide-react'
import { componentRegistry } from './ai-components'
import { Transmit } from '@adonisjs/transmit-client'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

let transmitInstance: Transmit | null = null
function getTransmit() {
  if (typeof window !== 'undefined' && !transmitInstance) {
    transmitInstance = new Transmit({ baseUrl: window.location.origin })
  }
  return transmitInstance
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o assistente da Anua. Como posso ajudar você hoje? Pergunte sobre alunos, turmas, financeiro ou qualquer informação da escola.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toolResultsRef = useRef<Record<string, any>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    setInput('')
    setError(null)

    const userMessage: Message = { role: 'user', content: trimmedInput }
    setMessages((prev) => [...prev, userMessage])

    setIsLoading(true)
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    const clientId = crypto.randomUUID()
    const channel = `ai:${clientId}`
    let assistantContent = ''

    try {
      const subscription = getTransmit()!.subscription(channel)
      await subscription.create()

      subscription.onMessage((data: { type: string; text?: string; name?: string; data?: any }) => {
        if (data.type === 'chunk' && data.text) {
          assistantContent += data.text
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
            return updated
          })
        }
        if (data.type === 'component' && data.name) {
          toolResultsRef.current[data.name] = data.data
          const Component = componentRegistry[data.name]
          if (Component) {
            setMessages((prev) => {
              const updated = [...prev]
              const lastIdx = updated.length - 1
              const prevContent = updated[lastIdx]?.content || ''
              updated[lastIdx] = {
                role: 'assistant',
                content: prevContent + '\n[COMPONENT:' + data.name + ']',
              }
              return updated
            })
          }
        }
      })

      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: trimmedInput,
          clientId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor (${response.status})`)
      }

      await new Promise<void>((resolve) => {
        const unsub = subscription.onMessage((data: { type: string }) => {
          if (data.type === 'done') {
            unsub()
            resolve()
          }
        })
        setTimeout(() => resolve(), 30000)
      })

      await subscription.delete()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado'
      setError(message)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Assistente Anua
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.role === 'assistant' && message.content === '' && isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Pensando...</span>
                  </div>
                ) : message.content?.includes('[COMPONENT:') ? (
                  <div>
                    {message.content.split('[COMPONENT:').map((part, i) => {
                      if (i === 0) return <p key={i} className="whitespace-pre-wrap">{part}</p>
                      const endIdx = part.indexOf(']')
                      if (endIdx === -1) return <p key={i} className="whitespace-pre-wrap">{part}</p>
                      const compName = part.substring(0, endIdx)
                      const rest = part.substring(endIdx + 1)
                      const Component = componentRegistry[compName]
                      const compData = toolResultsRef.current[compName]
                      return (
                        <div key={i}>
                          {Component && compData ? <Component {...compData} /> : null}
                          {rest ? <p className="whitespace-pre-wrap pt-2">{rest}</p> : null}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex w-full gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
