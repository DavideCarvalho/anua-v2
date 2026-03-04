import { Mail } from 'lucide-react'
import { RpgInGamePanel } from './rpg-in-game-panel'
import { GamifiedOrdersContainer } from '../../containers/gamificacao/gamified-orders-container'

interface RpgCorreioOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RpgCorreioOverlay({ open, onOpenChange }: RpgCorreioOverlayProps) {
  return (
    <RpgInGamePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Correio"
      icon={<Mail className="size-5" />}
    >
      <GamifiedOrdersContainer />
    </RpgInGamePanel>
  )
}
