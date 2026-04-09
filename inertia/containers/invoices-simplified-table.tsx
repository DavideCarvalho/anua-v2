import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Route } from '@tuyau/core/types'
import { DateTime } from 'luxon'

import { api } from '~/lib/api'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { formatCurrency } from '~/lib/utils'
import { Loader2 } from 'lucide-react'
import { MarkInvoicePaidModal } from './invoices/mark-invoice-paid-modal'
import { CreateAgreementModal } from './invoices/create-agreement-modal'

type InvoicesIndexResponse = Route.Response<'api.v1.invoices.index'>
type InvoiceItem = InvoicesIndexResponse['data'][number]
type ActionMode = 'mark-paid' | 'agreement' | null

const ACTIONABLE_STATUSES = ['OPEN', 'PENDING', 'OVERDUE'] as const

function formatDueDate(value: string | Date | null | undefined) {
  if (!value) return '-'

  const parsed = DateTime.fromISO(String(value))
  if (!parsed.isValid) return '-'

  return parsed.toFormat('dd/MM/yyyy')
}

export function InvoicesSimplifiedTable() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null)
  const [actionMode, setActionMode] = useState<ActionMode>(null)

  const { data, isLoading, isError, refetch } = useQuery(
    api.api.v1.invoices.index.queryOptions({
      query: {
        status: ACTIONABLE_STATUSES.join(','),
        sortBy: 'dueDate',
        sortDirection: 'asc',
        page: 1,
        limit: 50,
      },
    })
  )

  const invoices = useMemo(() => {
    const rows = (data?.data ?? []) as InvoiceItem[]
    return rows.filter(
      (invoice): invoice is InvoiceItem =>
        !!invoice.status && ACTIONABLE_STATUSES.includes(invoice.status as (typeof ACTIONABLE_STATUSES)[number])
    )
  }, [data])

  const closeModal = () => {
    setActionMode(null)
    setSelectedInvoice(null)
  }

  if (isLoading) {
    return (
      <div data-testid="simplified-invoices-table">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando faturas...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div data-testid="simplified-invoices-table">
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Nao foi possivel carregar as faturas.</p>
            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div data-testid="simplified-invoices-table">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Aluno</th>
                <th className="px-4 py-3 text-left font-medium">Vencimento</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma fatura pendente ou vencida.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border" data-testid="simplified-invoices-table">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Aluno</th>
              <th className="px-4 py-3 text-left font-medium">Vencimento</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-right font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isOverdue = invoice.status === 'OVERDUE'
              const actionLabel = isOverdue ? 'Negociar' : 'Receber'

              return (
                <tr key={invoice.id} className="border-t">
                  <td className="px-4 py-3">{invoice.student?.user?.name || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDueDate(invoice.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(Number(invoice.chargedAmount || invoice.totalAmount || 0))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant={isOverdue ? 'outline' : 'default'}
                      onClick={() => {
                        setSelectedInvoice(invoice)
                        setActionMode(isOverdue ? 'agreement' : 'mark-paid')
                      }}
                    >
                      {actionLabel}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedInvoice && actionMode === 'mark-paid' && (
        <MarkInvoicePaidModal
          invoice={{
            id: selectedInvoice.id,
            totalAmount: Number(selectedInvoice.totalAmount || 0),
            student: selectedInvoice.student,
            month: selectedInvoice.month,
            year: selectedInvoice.year,
          }}
          open
          onOpenChange={(open) => {
            if (!open) closeModal()
          }}
        />
      )}

      {selectedInvoice && actionMode === 'agreement' && (
        <CreateAgreementModal
          invoice={{
            id: selectedInvoice.id,
            totalAmount: Number(selectedInvoice.totalAmount || 0),
            status: selectedInvoice.status || 'OVERDUE',
            month: selectedInvoice.month,
            year: selectedInvoice.year,
            dueDate: selectedInvoice.dueDate,
            student: selectedInvoice.student,
          }}
          open
          onOpenChange={(open) => {
            if (!open) closeModal()
          }}
        />
      )}
    </>
  )
}
