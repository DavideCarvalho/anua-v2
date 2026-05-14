import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'

// Built-in enum dictionaries for the columns our schema actually has. The
// model passes `enumColumns: { status: 'invoiceStatus' }` to point a column
// at one of these dictionaries; we never trust the model to invent the
// mapping itself (it would hallucinate friendly labels and drift).
const ENUM_DICTIONARIES: Record<string, Record<string, string>> = {
  invoiceStatus: {
    OPEN: 'Em aberto',
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Vencido',
    CANCELLED: 'Cancelado',
    RENEGOTIATED: 'Renegociado',
  },
  invoiceType: {
    MONTHLY: 'Mensal',
    ANNUAL: 'Anual',
    ENROLLMENT: 'Matrícula',
  },
  enrollmentStatus: {
    REGISTERED: 'Matriculado',
    PENDING: 'Pendente',
    CANCELLED: 'Cancelado',
    TRANSFERRED: 'Transferido',
  },
  priority: {
    high: 'Urgente',
    normal: 'Atenção',
    low: 'Informativo',
  },
}

// Default column labels for the common things the model emits when it
// doesn't bother aliasing.
const DEFAULT_COLUMN_LABELS: Record<string, string> = {
  id: 'ID',
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  status: 'Status',
  type: 'Tipo',
  qtd: 'Quantidade',
  total: 'Total',
  turma: 'Turma',
  class_name: 'Turma',
  total_alunos: 'Total de alunos',
  total_turmas: 'Total de turmas',
  total_professores: 'Total de professores',
  enrollmentStatus: 'Status',
  invoiceStatus: 'Status',
  invoiceType: 'Tipo',
  monthlyPaymentAmount: 'Mensalidade',
  overdueAmount: 'Inadimplência',
  createdAt: 'Criado em',
  updatedAt: 'Atualizado em',
  dueDate: 'Vencimento',
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const DESCRIPTION = `Formata uma matriz de linhas vinda do queryDatabase para apresentação ao usuário. Use SEMPRE após queryDatabase quando os dados forem mostrados em DataTable via renderResult.

A tool faz três coisas:
1. Converte colunas de centavos (BRL) em strings formatadas (R$ 1.500,00)
2. Mapeia valores de enums (status, type, etc.) para PT-BR
3. Traduz nomes técnicos de colunas em rótulos legíveis

Dicionários de enum disponíveis (use o nome do dicionário em \`enumColumns\`):
- invoiceStatus: OPEN/PENDING/PAID/OVERDUE/CANCELLED/RENEGOTIATED
- invoiceType: MONTHLY/ANNUAL/ENROLLMENT
- enrollmentStatus: REGISTERED/PENDING/CANCELLED/TRANSFERRED
- priority: high/normal/low

Exemplo de chamada:
formatRows({
  rows: [{ name: 'João', status: 'OVERDUE', total: 150000 }],
  moneyColumns: ['total'],
  enumColumns: { status: 'invoiceStatus' },
  columnLabels: { name: 'Aluno', total: 'Valor', status: 'Situação' }
})

Retorna { rows, columnLabels } onde rows tem os valores transformados e columnLabels mapeia cada coluna para o rótulo final.`

const RowSchema = z.record(z.string(), z.unknown())

export function createFormatRows() {
  return defineTool({
    name: 'formatRows',
    description: DESCRIPTION,
    parameters: z.object({
      rows: z.array(RowSchema).describe('Linhas brutas vindas do queryDatabase'),
      moneyColumns: z
        .array(z.string())
        .optional()
        .describe('Colunas cujos valores são inteiros em centavos (BRL)'),
      enumColumns: z
        .record(z.string(), z.string())
        .optional()
        .describe('Mapeamento coluna→dicionário de enum, e.g. { status: "invoiceStatus" }'),
      columnLabels: z
        .record(z.string(), z.string())
        .optional()
        .describe('Override manual de rótulo por coluna'),
    }),
    execute: async ({ rows, moneyColumns = [], enumColumns = {}, columnLabels = {} }) => {
      const moneySet = new Set(moneyColumns)

      const formattedRows = rows.map((row: Record<string, unknown>) => {
        const out: Record<string, string> = {}
        for (const [col, value] of Object.entries(row)) {
          if (value === null || value === undefined || value === '') {
            out[col] = '—'
            continue
          }
          const enumKey = enumColumns[col]
          const dict = enumKey ? ENUM_DICTIONARIES[enumKey] : undefined
          if (dict && typeof value === 'string' && dict[value]) {
            out[col] = dict[value]
            continue
          }
          if (moneySet.has(col)) {
            const n = Number(value)
            if (Number.isFinite(n) && Number.isInteger(n)) {
              out[col] = formatBRL(n)
              continue
            }
          }
          if (typeof value === 'boolean') {
            out[col] = value ? 'Sim' : 'Não'
            continue
          }
          out[col] = String(value)
        }
        return out
      })

      const cols = rows.length > 0 ? Object.keys(rows[0]) : []
      const finalLabels: Record<string, string> = {}
      for (const col of cols) {
        finalLabels[col] = columnLabels[col] ?? DEFAULT_COLUMN_LABELS[col] ?? humanizeFallback(col)
      }

      return { rows: formattedRows, columnLabels: finalLabels }
    },
  })
}

function humanizeFallback(col: string): string {
  const spaced = col
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

toolRegistry.register('gestor', createFormatRows)
toolRegistry.register('comunicador', createFormatRows)
toolRegistry.register('coordenador', createFormatRows)
toolRegistry.register('professor', createFormatRows)
toolRegistry.register('responsavel', createFormatRows)
