# Design: Contrato e Bolsa no BillingStep (Admin)

**Data:** 2026-01-26
**Local:** `/escola/administrativo/alunos` → Modal "Nova Matrícula" → Step 5 (Cobrança)

## Contexto

Quando o admin adiciona um aluno no último step, ao escolher o level:
- Mostrar o contrato vinculado a esse level
- Permitir aplicar uma scholarship para desconto
- Exibir documentos exigidos pelo contrato

## Fluxo

```
Seleção do Level
       │
       ▼
  Tem contrato vinculado?
       │
   ┌───┴───┐
   │       │
  SIM     NÃO
   │       │
   ▼       ▼
Mostra:   Oculta seções
- Contrato   de pagamento
- Bolsa      (só mostra
- Pagamento  acadêmicas)
- Documentos
```

## Seções do BillingStep

### 1. Informações Acadêmicas (existente)

Mantém como está:
- Período Letivo (select)
- Curso (select)
- Level/Série (select)
- Turma (select, opcional)

### 2. Contrato Vinculado (NOVO)

Aparece quando: `levelId` + `academicPeriodId` tem contrato associado.

**Exibe:**
- Nome do contrato
- Taxa de Matrícula (R$)
- Mensalidade (R$)
- Número de Parcelas
- Tipo de Pagamento (Mensal/À vista)

**Busca:** Query no backend por `Contract` onde `levelId` e `academicPeriodId` correspondem.

### 3. Aplicar Bolsa (NOVO)

**Componente:** Dropdown com scholarships ativas da escola

**Lista:** Todas `Scholarship` onde:
- `schoolId` = escola atual
- `isActive` = true

**Exibição no dropdown:**
```
Nome da Bolsa (30% mensalidade, 20% matrícula)
```

**Ao selecionar, mostra comparativo:**

| Item | Original | Desconto | Final |
|------|----------|----------|-------|
| Matrícula | R$ 500,00 | 20% | R$ 400,00 |
| Mensalidade | R$ 1.200,00 | 30% | R$ 840,00 |

**Economia total:** Calcula (desconto matrícula) + (desconto mensalidade × parcelas)

### 4. Pagamento (atualizado)

**Campos:**
- Forma de Pagamento (Boleto, Cartão, PIX)
- Dia de Vencimento (1-31)
- Parcelas da Matrícula
- Parcelas da Mensalidade

**Lógica de parcelas:**

```typescript
if (contract.flexibleInstallments === false) {
  // Usa valor do contrato, readonly
  installments = contract.installments
  disabled = true
} else {
  // Calcula meses restantes até fim do período
  const monthsRemaining = calculateMonthsUntilPeriodEnd(academicPeriod.endDate)
  maxInstallments = Math.min(contract.installments, monthsRemaining)
  // Admin pode escolher de 1 até maxInstallments
}
```

### 5. Documentos Exigidos (NOVO)

**Lista:** Todos `ContractDocument` vinculados ao contrato

**Exibição:**
```
☐ Certidão de Nascimento     [Anexar arquivo]
☐ RG ou CPF do Aluno         [Anexar arquivo]
☐ Comprovante de Residência  [Anexar arquivo]
```

**Comportamento:**
- Upload é opcional durante matrícula
- Documentos não anexados ficam com status `PENDING`
- Responsável/aluno pode completar depois na área deles

## Modelo de Dados

### Buscar contrato

```typescript
// Endpoint: GET /api/contracts/by-level
// Query: { levelId, academicPeriodId }

const contract = await Contract.query()
  .where('levelId', levelId)
  .where('academicPeriodId', academicPeriodId)
  .preload('documents')
  .first()
```

### Buscar scholarships

```typescript
// Endpoint: GET /api/scholarships
// Query: { active: true }

const scholarships = await Scholarship.query()
  .where('schoolId', schoolId)
  .where('isActive', true)
```

### Form data atualizado

```typescript
billing: {
  // Existentes
  academicPeriodId: string
  courseId: string
  levelId: string
  classId: string
  paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  paymentDate: number

  // Atualizados (vêm do contrato)
  contractId: string | null
  monthlyFee: number        // do contrato
  enrollmentFee: number     // do contrato
  installments: number      // do contrato ou calculado
  enrollmentInstallments: number

  // Novos
  scholarshipId: string | null
  discountPercentage: number        // calculado da bolsa
  enrollmentDiscountPercentage: number

  // Documentos (opcional)
  documents: Array<{
    contractDocumentId: string
    file: File | null
  }>
}
```

## Componentes a Criar/Modificar

### Modificar
- `inertia/containers/students/new-student-modal/steps/billing-step.tsx`
- `inertia/containers/students/new-student-modal/schema.ts`
- `app/controllers/students/enroll_student_controller.ts`

### Criar
- `inertia/components/enrollment/contract-details-card.tsx`
- `inertia/components/enrollment/scholarship-selector.tsx`
- `inertia/components/enrollment/discount-comparison.tsx`
- `inertia/components/enrollment/required-documents-list.tsx`
- `app/controllers/contracts/get_contract_by_level_controller.ts`
- `inertia/hooks/queries/use_contract_by_level.ts`
- `inertia/hooks/queries/use_scholarships.ts`

## API Endpoints

### GET /api/contracts/by-level
```typescript
// Query params
{ levelId: string, academicPeriodId: string }

// Response
{
  id: string
  name: string
  enrollmentValue: number
  ammount: number  // mensalidade
  installments: number
  enrollmentValueInstallments: number
  flexibleInstallments: boolean
  paymentType: 'MONTHLY' | 'UPFRONT'
  documents: Array<{
    id: string
    name: string
    required: boolean
  }>
}
```

### GET /api/scholarships (já existe, verificar se retorna tudo necessário)
```typescript
// Response
Array<{
  id: string
  name: string
  code: string
  type: string
  discountPercentage: number
  enrollmentDiscountPercentage: number
}>
```

## UI States

### Loading
- Skeleton enquanto busca contrato após selecionar level

### Sem contrato
- Oculta seções de pagamento
- Mostra apenas seleção acadêmica
- Admin pode prosseguir (matrícula sem contrato definido)

### Com contrato
- Exibe todas as seções
- Valores pré-preenchidos do contrato

### Com bolsa aplicada
- Mostra comparativo de valores
- Atualiza valores finais em tempo real
