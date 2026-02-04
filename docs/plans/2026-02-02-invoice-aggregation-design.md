# Invoice (Fatura) — Design

## Problema

StudentPayment funciona como cobrança individual. Não existe conceito de fatura que agrupe cobranças do mês numa cobrança única pro responsável. Isso dificulta: cobrança unificada no gateway, rastreamento de valor líquido recebido, e agregação de diferentes tipos de cobrança (mensalidade + cantina + loja).

## Decisões

1. **Modelo novo `Invoice`** que agrupa StudentPayments numa cobrança única por aluno
2. **StudentPayment continua como item individual** — não muda estrutura, ganha campo `invoiceId`
3. **Ambos MONTHLY e UPFRONT geram Invoice** — ambos geram Invoices mês a mês. A única exceção é UPFRONT com cartão de crédito, onde a escola recebe tudo de uma vez (uma Invoice só) e o responsável parcela com o banco
4. **Valor líquido (`netAmountReceived`) fica na Invoice** — preenchido manualmente quando pago fora do gateway
5. **Invoice tem status próprio** — OPEN, PENDING, PAID, OVERDUE, CANCELLED
6. **Itens pós-fechamento vão pro mês seguinte** — não recalcula Invoice já emitida (só MONTHLY)
7. **Cantina/loja fiado geram StudentPayment vinculado** — CanteenPurchase e StoreOrder referenciam o StudentPaymentId

## Modelo Invoice

```
Invoice
├── id              UUID v7 (PK)
├── studentId       FK → Student
├── contractId      FK → Contract
├── type            MONTHLY | UPFRONT
├── month           Int | null (null pra UPFRONT)
├── year            Int | null (null pra UPFRONT)
├── dueDate         Date
├── status          OPEN | PENDING | PAID | OVERDUE | CANCELLED
├── totalAmount     Int (centavos)
├── netAmountReceived  Int | null (centavos, só manual)
├── paidAt          DateTime | null
├── paymentMethod   PIX | BOLETO | CREDIT_CARD | CASH | OTHER | null
├── paymentGatewayId  String | null (ID no Asaas)
├── paymentGateway  ASAAS | CUSTOM | null
├── observation     String | null
├── createdAt       DateTime
└── updatedAt       DateTime
```

**MONTHLY:** Uma Invoice por mês. Agrupa StudentPayments do mês (mensalidade + cantina fiado + loja fiado + etc).

**UPFRONT pix/boleto:** Mesmo comportamento que MONTHLY — gera Invoices mês a mês com as parcelas. A diferença é conceitual (valor total definido antecipado no contrato).

**UPFRONT cartão de crédito:** Uma única Invoice com o valor total. Escola recebe tudo de uma vez (menos taxa), responsável parcela com o banco.

**Relacionamentos:**
- Invoice hasMany StudentPayment (via `invoiceId`)
- Invoice belongsTo Student
- Invoice belongsTo Contract

## Mudanças em tabelas existentes

### StudentPayment
- Novo campo: `invoiceId` (nullable FK → Invoice)
- Null = ainda não faturado (entra na próxima Invoice)

### CanteenPurchase
- Novo campo: `studentPaymentId` (nullable FK → StudentPayment)
- Preenchido quando compra é fiado (sem crédito suficiente)
- Null = pago com crédito, dinheiro ou cartão na hora

### StoreOrder
- Novo campo: `studentPaymentId` (nullable FK → StudentPayment)
- Preenchido quando parte em dinheiro é fiado
- Null = pago só com pontos ou pago na hora

## Fluxos

### 1a. Fechamento mensal (MONTHLY)

Job/cron roda no início do mês (ou X dias antes do vencimento):

```
Para cada aluno com contrato MONTHLY ativo:
  1. Buscar StudentPayments do mês com status NOT_PAID e sem invoiceId
     (TUITION, CANTEEN, STORE, COURSE, OTHER, etc.)
  2. Criar Invoice type=MONTHLY com totalAmount = soma dos amounts
  3. Setar invoiceId em cada StudentPayment
  4. Se contrato usa gateway → criar cobrança no Asaas com valor total
  5. Mudar status da Invoice pra PENDING (se gateway) ou manter OPEN (se manual)
```

### 1b. UPFRONT pix/boleto

Mesmo fluxo do MONTHLY — job mensal gera Invoices com as parcelas do mês. Invoice type=UPFRONT.

### 1c. UPFRONT cartão de crédito

```
Aluno matriculado com contrato UPFRONT + cartão:
  1. Gerar todos os StudentPayments do contrato
  2. Criar uma única Invoice type=UPFRONT com totalAmount = soma total
  3. Setar invoiceId em cada StudentPayment
  4. Criar cobrança única no gateway
  5. Escola recebe valor cheio (menos taxa), responsável parcela com o banco
```

### 2. Cantina fiado

```
Aluno compra na cantina, não tem crédito suficiente:
  1. Criar CanteenPurchase com status PENDING
  2. Criar StudentPayment tipo CANTEEN com amount = valor da compra
  3. Setar studentPaymentId na CanteenPurchase
  4. StudentPayment fica com invoiceId = null (entra na próxima Invoice)
```

### 3. Loja fiado

```
Aluno compra na loja, parte em dinheiro:
  1. Criar StoreOrder normalmente
  2. Criar StudentPayment tipo STORE (ou OTHER) com amount = moneyPaid
  3. Setar studentPaymentId no StoreOrder
  4. StudentPayment fica com invoiceId = null (entra na próxima Invoice)
```

### 4. Pagamento via gateway

```
Webhook Asaas notifica pagamento:
  1. Encontrar Invoice pelo paymentGatewayId
  2. Marcar Invoice como PAID, setar paidAt
  3. Propagar PAID pra todos StudentPayments com esse invoiceId
  4. Atualizar status das CanteenPurchases/StoreOrders vinculados
```

### 5. Pagamento manual

```
Escola marca Invoice como paga:
  1. Informar paymentMethod e netAmountReceived (obrigatório se não é gateway)
  2. Opcionalmente informar observation
  3. Marcar Invoice como PAID, setar paidAt
  4. Propagar PAID pra todos StudentPayments vinculados
```

### 6. Inadimplência

```
Job diário:
  1. Buscar Invoices com status OPEN ou PENDING e dueDate < hoje
  2. Mudar status pra OVERDUE
  3. Propagar OVERDUE pros StudentPayments vinculados
```

## O que NÃO muda

- StudentPayment mantém todos os campos atuais
- Filtros e listagem de StudentPayments continuam funcionando
- Acordos (Agreement) continuam com fluxo próprio
- TuitionTransfer continua referenciando StudentPayment individual
