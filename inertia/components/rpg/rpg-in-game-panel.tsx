import { X } from 'lucide-react'
import { useEffect } from 'react'

interface RpgInGamePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

/**
 * In-game menu panel — appears centered over the game, like a real RPG menu.
 * Wooden frame, no side drawer. Covers only the game area.
 */
export function RpgInGamePanel({ open, onOpenChange, title, icon, children }: RpgInGamePanelProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      aria-modal
      aria-labelledby="rpg-panel-title"
      role="dialog"
    >
      {/* Backdrop — escurece o jogo */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
        aria-label="Fechar"
      />

      {/* Painel estilo jogo — moldura de madeira */}
      <div
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border-4 border-[#8B5E3C] bg-[#DEB887] shadow-[6px_6px_0px_#6B3F1F] dark:border-[#6B3F1F] dark:bg-[#8B5E3C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — tábua */}
        <div className="flex items-center justify-between border-b-2 border-[#8B5E3C] bg-[#A67B5B] px-4 py-3 dark:border-[#6B3F1F] dark:bg-[#6B3F1F]">
          <div className="flex items-center gap-2 font-display font-bold text-[#5C3A21] dark:text-amber-100">
            {icon}
            <span id="rpg-panel-title">{title}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Conteúdo — área clara */}
        <div className="flex-1 overflow-y-auto bg-[#F5E6D3] p-4 dark:bg-[#4A3728]">{children}</div>
      </div>
    </div>
  )
}
