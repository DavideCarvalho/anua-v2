# Histórico de Auditoria - Design

## Resumo

Implementar histórico de alterações para entidades financeiras usando `@stouder-io/adonis-auditing`. O histórico mostra quem fez a alteração, de onde veio, e um diff visual das mudanças.

## Decisões

| Aspecto | Decisão |
|---------|---------|
| Pacote | `@stouder-io/adonis-auditing` |
| Entidades auditadas | Invoice, StudentPayment, StudentHasLevel, Agreement, Contract |
| Visualização | Timeline com diff visual (antes → depois) |
| Autor | Usuário + sistema + contexto (ex: "João Silva via Editar Matrícula") |
| Acesso | Só admin/funcionários da escola |
| Onde aparece | Listagem de faturas (modal) + página dedicada por aluno |

## Backend

### Instalação

```bash
pnpm add @stouder-io/adonis-auditing
node ace configure @stouder-io/adonis-auditing
```

### Config (`config/auditing.ts`)

```typescript
import { defineConfig } from '@stouder-io/adonis-auditing'
import { HttpContext } from '@adonisjs/core/http'

export default defineConfig({
  userResolver: async () => {
    const ctx = HttpContext.get()
    return ctx?.auth?.user ?? null
  },
  resolvers: {
    ip_address: async () => {
      const ctx = HttpContext.get()
      return ctx?.request?.ip() ?? null
    },
    user_agent: async () => {
      const ctx = HttpContext.get()
      return ctx?.request?.header('user-agent') ?? null
    },
    url: async () => {
      const ctx = HttpContext.get()
      return ctx?.request?.url() ?? null
    },
    source: async () => {
      const ctx = HttpContext.get()
      // Captura o controller/job via header customizado ou route name
      return ctx?.route?.name ?? ctx?.request?.header('x-audit-source') ?? 'unknown'
    },
  },
})
```

### Models (5 arquivos)

Adicionar mixin `Auditable` a cada model:

```typescript
// app/models/invoice.ts
import { compose } from '@adonisjs/core/helpers'
import { Auditable } from '@stouder-io/adonis-auditing'

export default class Invoice extends compose(BaseModel, Auditable) {
  // ... campos existentes mantidos
}
```

Aplicar em:
- `app/models/invoice.ts`
- `app/models/student_payment.ts`
- `app/models/student_has_level.ts`
- `app/models/agreement.ts`
- `app/models/contract.ts`

### Endpoint

**Rota:** `GET /api/v1/audits/:entityType/:entityId`

**Controller:** `app/controllers/audits/list_audits_controller.ts`

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { Audit } from '@stouder-io/adonis-auditing'

const ENTITY_MAP = {
  invoice: 'Invoice',
  'student-payment': 'StudentPayment',
  'student-has-level': 'StudentHasLevel',
  agreement: 'Agreement',
  contract: 'Contract',
}

export default class ListAuditsController {
  async handle({ params, response }: HttpContext) {
    const { entityType, entityId } = params
    const auditableType = ENTITY_MAP[entityType]

    if (!auditableType) {
      return response.badRequest({ error: 'Invalid entity type' })
    }

    const audits = await Audit.query()
      .where('auditableType', auditableType)
      .where('auditableId', entityId)
      .orderBy('createdAt', 'desc')

    return audits
  }
}
```

**Rota adicional para histórico do aluno:**

`GET /api/v1/students/:studentId/audit-history` - retorna audits de todas as entidades relacionadas ao aluno.

### Validator

```typescript
// app/validators/audit.ts
import vine from '@vinejs/vine'

export const listAuditsValidator = vine.compile(
  vine.object({
    params: vine.object({
      entityType: vine.enum(['invoice', 'student-payment', 'student-has-level', 'agreement', 'contract']),
      entityId: vine.string().uuid(),
    }),
  })
)
```

## Frontend

### Componentes

**`inertia/components/audit-history-modal.tsx`**

Modal que recebe `entityType` e `entityId`, busca audits e renderiza timeline.

**`inertia/components/audit-diff-card.tsx`**

Card individual com:
- Header: ícone do evento + data/hora + autor + contexto
- Body: lista de campos alterados com valor antigo → novo

```
┌─────────────────────────────────────────────────────┐
│ 📝 Atualizado em 05/02/2026 às 14:32               │
│ Por: João Silva via Editar Matrícula               │
├─────────────────────────────────────────────────────┤
│ Valor         R$ 1.500,00  →  R$ 1.200,00         │
│ Desconto      0%           →  20%                  │
│ Vencimento    dia 9        →  dia 15               │
└─────────────────────────────────────────────────────┘
```

### Labels (`inertia/lib/audit-labels.ts`)

```typescript
// Campos por entidade
export const FIELD_LABELS: Record<string, Record<string, string>> = {
  Invoice: {
    totalAmount: 'Valor Total',
    dueDate: 'Vencimento',
    status: 'Status',
    paymentMethod: 'Forma de Pagamento',
  },
  StudentPayment: {
    amount: 'Valor',
    dueDate: 'Vencimento',
    status: 'Status',
    discountPercentage: 'Desconto',
    type: 'Tipo',
    invoiceId: 'Fatura',
  },
  StudentHasLevel: {
    contractId: 'Contrato',
    scholarshipId: 'Bolsa',
    paymentDay: 'Dia de Vencimento',
    installments: 'Parcelas',
    paymentMethod: 'Forma de Pagamento',
  },
  Agreement: {
    totalAmount: 'Valor Total',
    installments: 'Parcelas',
    status: 'Status',
  },
  Contract: {
    ammount: 'Valor',
    paymentType: 'Tipo de Pagamento',
    installments: 'Parcelas',
  },
}

// Source → label amigável
export const SOURCE_LABELS: Record<string, string> = {
  'students.update_enrollment': 'Editar Matrícula',
  'student_payments.create': 'Criar Pagamento',
  'student_payments.cancel': 'Cancelar Pagamento',
  'student_payments.update': 'Editar Pagamento',
  'GenerateStudentPaymentsJob': 'Sistema - Geração de Pagamentos',
  'ReconcilePaymentInvoiceJob': 'Sistema - Reconciliação de Fatura',
  'GenerateInvoices': 'Sistema - Geração de Faturas',
  'unknown': 'Sistema',
}

// Eventos
export const EVENT_LABELS: Record<string, string> = {
  created: 'Criado',
  updated: 'Atualizado',
  deleted: 'Removido',
}
```

### Query Hook

```typescript
// inertia/hooks/queries/use_audits.ts
import { useQuery } from '@tanstack/react-query'
import { tuyau } from '~/lib/api'

export function useAudits(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['audits', entityType, entityId],
    queryFn: () => tuyau.api.v1.audits[entityType][entityId].$get(),
    enabled: !!entityType && !!entityId,
  })
}

export function useStudentAuditHistory(studentId: string) {
  return useQuery({
    queryKey: ['student-audit-history', studentId],
    queryFn: () => tuyau.api.v1.students[studentId]['audit-history'].$get(),
    enabled: !!studentId,
  })
}
```

### Páginas/Containers modificados

1. **`inertia/containers/invoices-container.tsx`** - adicionar ícone de relógio em cada linha que abre `AuditHistoryModal`

2. **`inertia/pages/escola/administrativo/alunos/historico-financeiro.tsx`** - página dedicada com timeline unificada

## Arquivos

### Criar

| Arquivo | Descrição |
|---------|-----------|
| `config/auditing.ts` | Configuração do pacote |
| `app/controllers/audits/list_audits_controller.ts` | Endpoint de listagem |
| `app/controllers/audits/list_student_audit_history_controller.ts` | Histórico por aluno |
| `app/validators/audit.ts` | Validação |
| `inertia/components/audit-history-modal.tsx` | Modal de histórico |
| `inertia/components/audit-diff-card.tsx` | Card com diff |
| `inertia/hooks/queries/use_audits.ts` | Query hooks |
| `inertia/lib/audit-labels.ts` | Mapeamento de labels |
| `inertia/pages/escola/administrativo/alunos/historico-financeiro.tsx` | Página de histórico |

### Modificar

| Arquivo | Mudança |
|---------|---------|
| `app/models/invoice.ts` | Adicionar mixin Auditable |
| `app/models/student_payment.ts` | Adicionar mixin Auditable |
| `app/models/student_has_level.ts` | Adicionar mixin Auditable |
| `app/models/agreement.ts` | Adicionar mixin Auditable |
| `app/models/contract.ts` | Adicionar mixin Auditable |
| `start/routes.ts` | Adicionar rotas de audits |
| `inertia/containers/invoices-container.tsx` | Botão de histórico |
