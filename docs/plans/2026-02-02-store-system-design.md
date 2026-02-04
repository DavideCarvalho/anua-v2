# Store System Design

**Goal:** Sistema completo de loja para instituições, suportando lojas internas (da escola) e terceirizadas, com marketplace para alunos/responsáveis, PDV para operadores, e painel de gestão para donos de loja.

**Tech Stack:** AdonisJS 6 + Lucid ORM, PostgreSQL, VineJS, React (Inertia.js)

---

## Atores

| Ator | Acesso | Descrição |
|------|--------|-----------|
| Admin da escola | Painel escola | Gerencia todas as lojas (internas + terceirizadas), configura regras, vê settlements |
| Store Owner | Painel loja | Dono de loja terceirizada. Gerencia apenas sua loja: produtos, pedidos, financeiro |
| Aluno | Marketplace | Vê lojas das escolas onde está matriculado, faz pedidos |
| Responsável | Marketplace + Carteira | Mesma visão do aluno filtrada pelos filhos. Recarrega carteira via Asaas |
| Operador | PDV | Vendedor da loja, registra compras selecionando aluno |

---

## Modelo de Dados

### Tabelas novas

**`StoreInstallmentRule`** -- regras de parcelamento por loja

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text PK | UUID v7 |
| storeId | text FK | Referência à Store |
| minAmount | integer | Valor mínimo em centavos para permitir parcelamento |
| maxInstallments | integer | Número máximo de parcelas |
| isActive | boolean | Default true |
| createdAt | timestamp | |
| updatedAt | timestamp | |

Exemplo: loja X permite 2x acima de R$50 e 3x acima de R$100 (duas linhas).

**`WalletTopUp`** -- recargas de carteira do aluno

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text PK | UUID v7 |
| studentId | text FK | Referência ao Student |
| responsibleUserId | text FK | User que iniciou a recarga |
| amount | integer | Valor em centavos |
| status | enum | PENDING, PAID, FAILED, CANCELLED |
| paymentGateway | text | ASAAS |
| paymentGatewayId | text nullable | ID da cobrança no Asaas |
| paymentMethod | text nullable | PIX, BOLETO |
| paidAt | timestamp nullable | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Alterações em tabelas existentes

**`PlatformSettings`** -- adicionar campo:
- `defaultStorePlatformFeePercentage` (decimal, default 5.0) -- taxa padrão da plataforma para lojas

**`StoreFinancialSettings`** -- alterar campo:
- `platformFeePercentage` passa de obrigatório (default 0) para nullable. Se null, herda de `PlatformSettings.defaultStorePlatformFeePercentage`

**`User` role enum** -- adicionar valor:
- `STORE_OWNER` -- role para donos de lojas terceirizadas

---

## Permissões e Rotas

### Middleware novo

**`storeOwner()`** -- verifica que `auth.user.id === Store.ownerUserId` para a loja do request.

### Grupos de rotas

```
/api/stores/...              → admin da escola (CRUD completo, configurações, settlements)
/api/store-owner/...         → dono terceirizado (produtos, pedidos, financeiro da loja dele)
/api/marketplace/...         → aluno e responsável (catálogo, carrinho, checkout)
/api/store-pdv/...           → operador da loja (venda rápida, seleciona aluno)
/api/wallet/...              → responsável (recarga de carteira, extrato)
```

- Admin: middleware `auth()` + `impersonation()` + `selectedSchoolIds`
- Store Owner: middleware `auth()` + `storeOwner()`
- Marketplace: middleware `auth()` -- filtra por escolas da matrícula ativa do aluno/filhos do responsável
- PDV: middleware `auth()` + (admin ou storeOwner)
- Wallet: middleware `auth()` -- responsável autenticado

---

## Fluxo de Compra

Independente do ponto de entrada (aluno, responsável, operador), o fluxo converge:

### 1. Montar pedido
- Seleciona itens + quantidades
- Valida estoque, limites por aluno (`maxPerStudent`), itens ativos
- Calcula total (pontos e/ou dinheiro conforme `paymentMode` do item)

### 2. Escolher pagamento
- **IMMEDIATE + BALANCE** -- debita da carteira do aluno. Saldo insuficiente = bloqueio.
- **IMMEDIATE + PIX/CASH/CARD** -- pagamento direto. Operador confirma (PDV) ou gateway confirma (PIX).
- **DEFERRED** -- vai pra fatura. Sistema consulta `StoreInstallmentRule` da loja para o valor do pedido. Exibe opções de parcelamento disponíveis. Comprador escolhe parcelas. Gera StudentPayment(s) vinculados ao StoreOrder, que entram na próxima Invoice.

### 3. Lifecycle do pedido
- Pagamento imediato: `PENDING_APPROVAL` → `APPROVED` → `PREPARING` → `READY` → `DELIVERED`
- Pagamento diferido: `PENDING_PAYMENT` → (pago via Invoice) → `PENDING_APPROVAL` → mesmo fluxo
- Loja com `requiresApproval = false`: pula direto pra `PREPARING`

### 4. Settlement (lojas terceirizadas)
- Fim do mês: calcula vendas da loja
- Desconta comissão (`Store.commissionPercentage`) + taxa da plataforma (`StoreFinancialSettings.platformFeePercentage` ou fallback `PlatformSettings.defaultStorePlatformFeePercentage`)
- Gera `StoreSettlement` para repasse

---

## Recarga de Carteira (Wallet TopUp)

1. Responsável escolhe filho, valor e método (PIX ou boleto) na tela `/responsavel/carteira`
2. Sistema cria cobrança no Asaas, salva `WalletTopUp` com status PENDING
3. Asaas confirma pagamento via webhook
4. Sistema atualiza `WalletTopUp` → PAID, credita `Student.balance`, cria `StudentBalanceTransaction` tipo TOP_UP

---

## Frontend -- Estrutura de Páginas

### Painel Admin da Escola (layout escola existente)

| Rota | Descrição |
|------|-----------|
| `/escola/lojas` | Lista de lojas (internas + terceirizadas), criar/editar |
| `/escola/lojas/:id` | Detalhe da loja, produtos, pedidos, configurações financeiras |
| `/escola/lojas/:id/settlements` | Repasses da loja |

### Painel Store Owner (layout próprio, novo)

| Rota | Descrição |
|------|-----------|
| `/loja` | Dashboard (resumo de vendas, pedidos pendentes) |
| `/loja/produtos` | CRUD de produtos |
| `/loja/pedidos` | Lista de pedidos, ações (aprovar, preparar, entregar) |
| `/loja/financeiro` | Settlements, configurações de pix/banco |

### Marketplace Aluno (layout aluno existente)

| Rota | Descrição |
|------|-----------|
| `/aluno/loja` | Marketplace unificado, filtro por loja/categoria |
| `/aluno/loja/:storeId` | Vitrine de uma loja específica |
| `/aluno/loja/carrinho` | Carrinho + checkout |
| `/aluno/loja/pedidos` | Histórico de pedidos |

### Marketplace Responsável (layout responsável existente)

| Rota | Descrição |
|------|-----------|
| `/responsavel/loja` | Marketplace filtrado pelos filhos. Seleciona pra qual filho compra |
| `/responsavel/carteira` | Recarga de carteira via Asaas, extrato de saldo por filho |

### PDV Operador

| Rota | Descrição |
|------|-----------|
| `/escola/lojas/:id/pdv` ou `/loja/pdv` | Interface simplificada, busca aluno, seleciona itens, venda rápida |

---

## Fases de Implementação

### Fase 1 -- Fundação (Backend + Admin)

Foco: toda a infra de dados e o painel do admin da escola.

**Backend:**
- Migration: `StoreInstallmentRule`
- Migration: `WalletTopUp` + enum `WalletTopUpStatus`
- Migration: alter `PlatformSettings` (add `defaultStorePlatformFeePercentage`)
- Migration: alter `StoreFinancialSettings` (tornar `platformFeePercentage` nullable)
- Migration: add `STORE_OWNER` ao enum de roles do User
- Model + DTO: `StoreInstallmentRule`, `WalletTopUp`
- Atualizar models: `PlatformSettings`, `StoreFinancialSettings`
- Validators: `StoreInstallmentRule`, `WalletTopUp`
- Controllers CRUD: `StoreInstallmentRule`

**Frontend:**
- `/escola/lojas` -- lista de lojas com filtros (tipo, status)
- `/escola/lojas/:id` -- detalhe com abas: produtos, pedidos, regras de parcelamento, configurações financeiras, settlements
- Criar/editar loja (form com tipo INTERNAL/THIRD_PARTY, vincular owner se terceirizada)
- CRUD regras de parcelamento por loja
- Configurações financeiras (taxa da plataforma override, dados PIX)

### Fase 2 -- Store Owner

Foco: autonomia do dono de loja terceirizada.

**Backend:**
- Middleware `storeOwner()`
- Rotas `/api/store-owner/*` com controllers dedicados
- Controller: convite/cadastro de store owner pela escola

**Frontend:**
- Layout novo para `/loja`
- `/loja` -- dashboard com métricas (vendas do mês, pedidos pendentes)
- `/loja/produtos` -- CRUD de produtos (nome, preço, estoque, categoria, imagem)
- `/loja/pedidos` -- lista com ações (aprovar, rejeitar, marcar preparando, pronto, entregue)
- `/loja/financeiro` -- ver settlements, editar dados bancários/PIX

### Fase 3 -- Marketplace (Aluno + Responsável)

Foco: experiência de compra.

**Backend:**
- Controllers marketplace: listar lojas/produtos filtrados por escola da matrícula
- Controller de checkout unificado (valida estoque, regras de parcelamento, cria pedido)
- Lógica de pagamento DEFERRED: consulta `StoreInstallmentRule`, gera StudentPayments, vincula a Invoice

**Frontend:**
- `/aluno/loja` -- marketplace unificado com grid de produtos, filtros (loja, categoria, preço)
- `/aluno/loja/:storeId` -- vitrine individual da loja
- `/aluno/loja/carrinho` -- carrinho de compras, seleção de pagamento (saldo, PIX, diferido + parcelas)
- `/aluno/loja/pedidos` -- histórico com status do pedido
- `/responsavel/loja` -- mesma estrutura, com seletor de filho
- Componente de checkout compartilhado entre aluno e responsável

### Fase 4 -- Carteira e Recarga

Foco: self-service do responsável para recarregar carteira.

**Backend:**
- Integração Asaas: criar cobrança PIX/boleto
- Webhook Asaas: confirmar pagamento, creditar saldo
- Controllers: criar recarga, listar recargas, extrato de saldo

**Frontend:**
- `/responsavel/carteira` -- saldo por filho, botão recarregar
- Modal de recarga: escolher filho, valor, método (PIX/boleto)
- Exibir QR code PIX ou link do boleto
- Extrato de transações da carteira (top-ups, compras, reembolsos)

### Fase 5 -- PDV

Foco: interface de venda presencial.

**Backend:**
- Controller PDV: buscar aluno por nome/matrícula, criar pedido em nome do aluno
- Suportar pagamento imediato (saldo, cash, card, PIX)

**Frontend:**
- `/escola/lojas/:id/pdv` e `/loja/pdv`
- Interface simplificada: busca de aluno, grid de produtos rápido, total em tempo real
- Confirmação de pagamento (saldo debita na hora, cash/card operador confirma)
- Impressão/exibição de comprovante (opcional)

---

## Decisões Técnicas

- **IDs:** UUID v7 em todas as tabelas novas (padrão do projeto)
- **Valores monetários:** sempre em centavos (integer), padrão existente
- **Taxa da plataforma:** `StoreFinancialSettings.platformFeePercentage` nullable, fallback para `PlatformSettings.defaultStorePlatformFeePercentage`
- **Parcelamento:** via `StoreInstallmentRule` (múltiplas faixas por loja). Sem regra = sem parcelamento (só pagamento à vista ou 1x diferido)
- **Carteira:** usa `Student.balance` + `StudentBalanceTransaction` existentes. `WalletTopUp` nova tabela só para rastrear recargas via gateway
- **Store Owner:** role `STORE_OWNER` no User, vínculo via `Store.ownerUserId`. Middleware dedicado filtra acesso
