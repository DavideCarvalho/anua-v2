import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History, Loader2, ArrowLeft, FileText, CreditCard, GraduationCap, FileSignature, Handshake } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import { AuditDiffCard } from '~/components/audit-diff-card'
import { useStudentAuditHistory, type StudentAuditEntry } from '~/hooks/queries/use_audits'
import { useStudentQueryOptions } from '~/hooks/queries/use_student'
import { getEntityLabel } from '~/lib/audit_labels'

interface StudentAuditHistoryContainerProps {
  studentId: string
}

const ENTITY_ICONS: Record<string, typeof FileText> = {
  Invoice: FileText,
  StudentPayment: CreditCard,
  StudentHasLevel: GraduationCap,
  Contract: FileSignature,
  Agreement: Handshake,
}

export function StudentAuditHistoryContainer({ studentId }: StudentAuditHistoryContainerProps) {
  const { data: student } = useQuery(useStudentQueryOptions(studentId))
  const { data: audits, isLoading, error } = useStudentAuditHistory(studentId)

  // Group audits by date
  const groupedAudits = audits?.reduce((groups, audit) => {
    const date = format(new Date(audit.createdAt), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(audit)
    return groups
  }, {} as Record<string, StudentAuditEntry[]>)

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/escola/administrativo/alunos/editar?studentId=${studentId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Historico Financeiro
          </h1>
          {student && (
            <p className="text-muted-foreground">{student.user?.name}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alteracoes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Erro ao carregar historico
            </div>
          ) : !audits || audits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma alteracao registrada</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedAudits ?? {}).map(([date, dateAudits]) => (
                  <div key={date}>
                    <div className="sticky top-0 bg-background py-2 z-10">
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </Badge>
                    </div>
                    <div className="space-y-3 mt-2">
                      {dateAudits.map((audit) => {
                        const Icon = ENTITY_ICONS[audit.entityType] ?? FileText
                        return (
                          <div key={audit.id} className="relative pl-6">
                            <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="h-2.5 w-2.5 text-primary" />
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {getEntityLabel(audit.entityType)}
                            </div>
                            <AuditDiffCard
                              audit={audit}
                              entityType={audit.entityType}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
