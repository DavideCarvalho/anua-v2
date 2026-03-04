import { Backpack } from 'lucide-react'
import { RpgInGamePanel } from './rpg-in-game-panel'
import { GamifiedCartContainer } from '../../containers/gamificacao/gamified-cart-container'

interface RpgMochilaOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RpgMochilaOverlay({ open, onOpenChange }: RpgMochilaOverlayProps) {
  return (
    <RpgInGamePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Mochila"
      icon={<Backpack className="size-5" />}
    >
      <GamifiedCartContainer backHref="/aluno" />
    </RpgInGamePanel>
  )
}
