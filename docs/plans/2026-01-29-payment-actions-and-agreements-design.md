# Ações de Mensalidade e Criação de Acordos

## Objetivo

Adicionar menu de ações na tabela de mensalidades da escola com 4 funcionalidades: editar, marcar como pago, criar acordo (renegociação) e cancelar pagamento.

## Menu de Ações na Tabela

O botão `MoreHorizontal` existente vira um `DropdownMenu` com:

| Ação | Ícone | Visível quando |
|---|---|---|
| Editar | `Pencil` | NOT_PAID, PENDING, OVERDUE |
| Marcar como pago | `CheckCircle` | NOT_PAID, PENDING, OVERDUE |
| Criar acordo | `Handshake` | NOT_PAID, PENDING, OVERDUE (exceto type AGREEMENT) |
| Cancelar | `XCircle` | NOT_PAID, PENDING, OVERDUE (exceto type AGREEMENT) |

Pagamentos PAID, CANCELLED ou FAILED não mostram ações. Pagamentos type AGREEMENT podem ter Editar e Marcar como pago, mas não Criar acordo nem Cancelar.

Estado no container:
```ts
const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
const [activeModal, setActiveModal] = useState<'edit' | 'mark-paid' | 'cancel' | 'agreement' | null>(null)
```

## Modal: Editar Mensalidade

- Título: "Editar Mensalidade"
- Read-only no topo: nome do aluno, referência (mês/ano)
- Campos editáveis:
  - Valor (R$) - input numérico, > 0
  - Data de vencimento - input date, obrigatório
  - Desconto (%) - input numérico 0-100, mostra valor final calculado ao lado
- Mutation: `useUpdateStudentPayment` (já existe)
- Botões: Cancelar, Salvar

## Modal: Marcar como Pago

- Título: "Registrar Pagamento"
- Read-only no topo: nome do aluno, referência, valor da mensalidade
- Campos:
  - Data do pagamento - input date, default = hoje
  - Método de pagamento - Select: PIX, Boleto, Cartão de Crédito, Dinheiro, Outro
  - Valor pago (R$) - input numérico, default = valor da mensalidade. Se diferente, mostra badge "Valor diferente do original"
  - Observação - textarea opcional
- Mutation: `useMarkPaymentAsPaid` (estender pra aceitar campos extras via metadata)
- Botões: Cancelar, Confirmar Pagamento

## Dialog: Cancelar Pagamento

- AlertDialog destrutivo
- Título: "Cancelar Pagamento"
- Descrição: "Essa ação não pode ser desfeita."
- Read-only: nome do aluno, referência, valor
- Campo obrigatório: Motivo do cancelamento - textarea, mínimo 10 caracteres
- Mutation: `useCancelStudentPayment` (estender pra aceitar reason)
- Botões: Voltar (outline), Cancelar Pagamento (destructive)

## Modal: Criar Acordo (renegociação)

Modal único com seções empilhadas (sem stepper). Abre pré-selecionando o pagamento clicado.

### Seção 1 - Seleção de pagamentos

- Nome do aluno no topo (read-only)
- Lista todos os pagamentos não-pagos do aluno (query por studentId + status NOT_PAID/PENDING/OVERDUE)
- Cada item: checkbox + referência (mês/ano) + vencimento + valor + badge de status
- Pagamento que originou o clique já vem marcado
- Resumo abaixo: "X pagamentos selecionados - Total: R$ Y.YYY,ZZ"

### Seção 2 - Termos do acordo

- Número de parcelas - input numérico 1-36
- Data de início - input date, mínimo = hoje
- Dia de vencimento - input numérico 1-31
- Cálculo automático: "X parcelas de R$ Z,ZZ"

### Seção 3 - Descontos por pagamento antecipado (opcional)

- Seção colapsável
- Botão "+ Adicionar desconto" adiciona linha com:
  - Percentual (%) - input 0-100
  - Dias antes do vencimento - input 1-30
  - Botão remover (Trash2)
- Exemplo: "5% de desconto se pago até 5 dias antes do vencimento"
- Múltiplas faixas permitidas

### Rodapé

- Card de resumo: total do acordo, parcelas, primeira parcela em (data), vencimento todo dia X
- Botões: Cancelar, Criar Acordo

### O que acontece no submit

1. Cria `Agreement` com totalAmount, installments, startDate, paymentDay
2. Cria `AgreementEarlyDiscount` associados
3. Marca pagamentos originais como CANCELLED
4. Cria novos `StudentPayment` com:
   - type: AGREEMENT
   - agreementId vinculado
   - installmentNumber sequencial (1, 2, 3...)
   - dueDate calculado: startDate + N meses, no dia paymentDay
   - amount: totalAmount / installments

## Estrutura de Arquivos

### Frontend (modificar)

```
inertia/containers/student-payments-container.tsx
  - Adicionar DropdownMenu com 4 ações
  - useState pra modal ativo e payment selecionado

inertia/hooks/mutations/use_student_payment_mutations.ts
  - Estender useMarkPaymentAsPaid (metadata)
  - Estender useCancelStudentPayment (reason)
```

### Frontend (novo)

```
inertia/containers/student-payments/
  ├─ edit-payment-modal.tsx
  ├─ mark-paid-modal.tsx
  ├─ cancel-payment-dialog.tsx
  └─ create-agreement-modal.tsx

inertia/hooks/mutations/use_agreement_mutations.ts
  └─ useCreateAgreement()

inertia/hooks/queries/use_student_pending_payments.ts
  └─ Buscar pagamentos não-pagos de um aluno
```

### Backend (novo)

```
app/controllers/agreements/
  └─ create_agreement_controller.ts

app/validators/agreement.ts
```

### Backend (modificar)

```
start/routes.ts
  - POST /api/v1/agreements

app/controllers/student_payments/cancel_student_payment_controller.ts
  - Aceitar reason

app/controllers/student_payments/mark_payment_as_paid_controller.ts
  - Aceitar metadata (paymentMethod, amountPaid, observation)
```
