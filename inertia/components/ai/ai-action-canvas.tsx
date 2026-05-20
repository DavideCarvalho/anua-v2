import { useCallback, useRef, useState } from 'react'
import { GripVertical, X } from 'lucide-react'
import type { ToolUIPart } from 'ai'
import { CreateAssignmentCanvas } from './create-assignment-canvas'
import { EnterExamGradeCanvas } from './enter-exam-grade-canvas'

/**
 * Painel flutuante draggable que renderiza o form de uma "canvas tool". Vive
 * no root do AiChatPane, fora do fluxo de mensagens, pra ficar persistente
 * enquanto o usuário conversa. Esse arquivo só cuida do CHROME (drag, posição,
 * header com close) — o form em si vive em sub-components escolhidos por
 * toolName via switch abaixo.
 *
 * Sharp edge v1 (intencional, vou resolver na v2): cada nova chamada da IA
 * pra prepare* SUBSTITUI o form. Se o usuário editou manualmente e depois
 * pediu alteração via chat, a edição manual é perdida. Pra v2 a ideia é
 * mandar o estado atual do canvas pro backend e o AI receber isso de volta.
 */

const POSITION_KEY = 'ai-canvas-position'

type Position = { x: number; y: number }

function loadPosition(): Position {
  if (typeof window === 'undefined') return { x: 24, y: 80 }
  try {
    const raw = window.localStorage.getItem(POSITION_KEY)
    if (!raw) return { x: 24, y: 80 }
    const parsed = JSON.parse(raw)
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return { x: parsed.x, y: parsed.y }
    }
  } catch {
    // ignore corrupt localStorage
  }
  return { x: 24, y: 80 }
}

function savePosition(pos: Position) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(pos))
  } catch {
    // quota / private mode — ignore
  }
}

function toolNameOf(part: ToolUIPart): string {
  return part.type.slice('tool-'.length)
}

function titleFor(toolName: string): string {
  switch (toolName) {
    case 'prepareCreateAssignment':
      return 'Criar atividade'
    case 'prepareEnterExamGrade':
      return 'Lançar nota'
    default:
      return 'Ação'
  }
}

type AiActionCanvasProps = {
  threadId: string
  toolPart: ToolUIPart
  onClose: () => void
}

export function AiActionCanvas({ threadId, toolPart, onClose }: AiActionCanvasProps) {
  const [pos, setPos] = useState<Position>(() => loadPosition())
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  )
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    },
    [pos]
  )
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const next: Position = {
      x: Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.origY + dy)),
    }
    setPos(next)
  }, [])
  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      dragRef.current = null
      savePosition(pos)
    },
    [pos]
  )

  const toolName = toolNameOf(toolPart)

  return (
    <div
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 w-[360px] rounded-lg border border-border bg-background shadow-xl"
    >
      <div
        className="flex items-center justify-between gap-2 border-b border-border px-3 py-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: dragRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{titleFor(toolName)}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {toolName === 'prepareCreateAssignment' ? (
        <CreateAssignmentCanvas threadId={threadId} toolPart={toolPart} onClose={onClose} />
      ) : toolName === 'prepareEnterExamGrade' ? (
        <EnterExamGradeCanvas threadId={threadId} toolPart={toolPart} onClose={onClose} />
      ) : (
        <div className="px-3 py-4 text-sm text-muted-foreground">
          Canvas desconhecido: {toolName}
        </div>
      )}
    </div>
  )
}
