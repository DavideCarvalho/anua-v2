import { Backpack, Mail } from 'lucide-react'
import { useCart } from '../../contexts/cart-context'
import { Badge } from '../ui/badge'

interface RpgGameMenuProps {
  onOpenMochila: () => void
  onOpenCorreio: () => void
}

/**
 * In-game menu — small square buttons in the corner, like a real RPG.
 * Opens Mochila and Correio from within the game.
 */
export function RpgGameMenu({ onOpenMochila, onOpenCorreio }: RpgGameMenuProps) {
  const { totalItems } = useCart()

  return (
    <div className="absolute bottom-3 right-3 flex gap-1.5" style={{ zIndex: 25 }}>
      {/* Mochila button */}
      <button
        type="button"
        onClick={onOpenMochila}
        className="group relative flex size-11 items-center justify-center rounded-lg border-2 border-[#8B5E3C] bg-[#DEB887] shadow-[2px_2px_0px_#6B3F1F] transition-all hover:scale-105 hover:shadow-[3px_3px_0px_#6B3F1F] active:scale-95 dark:border-[#6B3F1F] dark:bg-[#8B5E3C]"
        aria-label="Abrir mochila"
      >
        <Backpack className="size-5 text-[#5C3A21] dark:text-amber-100" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1">
            <Badge className="h-4 min-w-4 justify-center px-1 text-[10px]">{totalItems}</Badge>
          </span>
        )}
      </button>

      {/* Correio button */}
      <button
        type="button"
        onClick={onOpenCorreio}
        className="group relative flex size-11 items-center justify-center rounded-lg border-2 border-[#8B5E3C] bg-[#DEB887] shadow-[2px_2px_0px_#6B3F1F] transition-all hover:scale-105 hover:shadow-[3px_3px_0px_#6B3F1F] active:scale-95 dark:border-[#6B3F1F] dark:bg-[#8B5E3C]"
        aria-label="Abrir correio"
      >
        <Mail className="size-5 text-[#5C3A21] dark:text-amber-100" />
      </button>
    </div>
  )
}
