import { History, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { ScrollArea } from '~/components/ui/scroll-area'
import { AuditDiffCard } from '~/components/audit-diff-card'
import { useAudits } from '~/hooks/queries/use_audits'
import { getEntityLabel } from '~/lib/audit_labels'

type EntityType = 'invoice' | 'student-payment' | 'student-has-level' | 'agreement' | 'contract'

interface AuditHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: EntityType
  entityId: string
  entityLabel?: string
}

// Map URL-friendly names to model names for display
const ENTITY_TYPE_MAP: Record<EntityType, string> = {
  invoice: 'Invoice',
  'student-payment': 'StudentPayment',
  'student-has-level': 'StudentHasLevel',
  agreement: 'Agreement',
  contract: 'Contract',
}

export function AuditHistoryModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityLabel,
}: AuditHistoryModalProps) {
  const { data: audits, isLoading, error } = useAudits(entityType, entityId)

  const modelType = ENTITY_TYPE_MAP[entityType]
  const title = entityLabel
    ? `Histórico: ${entityLabel}`
    : `Histórico de ${getEntityLabel(modelType)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Erro ao carregar histórico
            </div>
          ) : !audits || audits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma alteração registrada
            </div>
          ) : (
            <div className="space-y-3">
              {audits.map((audit) => (
                <AuditDiffCard
                  key={audit.id}
                  audit={audit}
                  entityType={modelType}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
