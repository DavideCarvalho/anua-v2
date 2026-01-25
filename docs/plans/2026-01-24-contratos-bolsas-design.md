# Design: Contratos e Bolsas

**Data:** 2026-01-24
**Status:** Aprovado

## Contexto

Implementar as telas de Contratos e Bolsas com todas as funcionalidades do sistema antigo (school-super-app), exceto integração DocuSeal.

## Escopo

### Incluído
- Juros/multa por atraso
- Descontos por antecipação
- Seguro de inadimplência
- Dias de pagamento
- Período letivo
- Parcelas flexíveis
- Campo código nas bolsas

### Excluído
- Integração DocuSeal (assinatura digital)

---

## 1. Tela de Listagem de Contratos

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Contratos                                                    │
│ Gerencie os modelos de contrato da escola                   │
├─────────────────────────────────────────────────────────────┤
│ [Filtro: Período Letivo ▼]  [Buscar...]      [+ Novo Contrato] │
├─────────────────────────────────────────────────────────────┤
│ Nome          │ Período    │ Valor    │ Parcelas │ Status │ │
│───────────────┼────────────┼──────────┼──────────┼────────┼─│
│ Fundamental I │ 2025       │ R$ 1.200 │ 12x      │ 🟢     │⋮│
└─────────────────────────────────────────────────────────────┘
```

### Colunas
- **Nome** - Nome do contrato
- **Período Letivo** - Ex: "Ano Letivo 2025"
- **Matrícula** - Valor da matrícula formatado (R$)
- **Mensalidade** - Valor do curso formatado
- **Parcelas** - "12x" ou "Flexível"
- **Status** - Toggle ativo/inativo
- **Ações** - Menu com Editar, Excluir

### Comportamento
- Clicar no contrato abre página de edição
- Filtro por período letivo
- Busca por nome

---

## 2. Página Criar/Editar Contrato

### Estrutura
Página dedicada com 3 abas:

### Aba 1: Informações Básicas
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | text | Sim |
| Período Letivo | select | Sim |
| Descrição | textarea | Não |
| Data de Término | date | Não |
| Seguro de Inadimplência | checkbox | Não |

### Aba 2: Pagamento
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Valor da Matrícula | currency | Não |
| Parcelas da Matrícula | number (1-12) | Não |
| Valor do Curso | currency | Sim |
| Tipo de Pagamento | radio (Mensal/À Vista) | Sim |
| Parcelas do Curso | number | Sim |
| Parcelas Flexíveis | checkbox | Não |
| Dias de Vencimento | multi-select (1-31) | Sim |

### Aba 3: Juros e Descontos
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Multa por atraso (%) | number | Não |
| Juros ao dia (%) | number | Não |
| Descontos por antecipação | lista dinâmica (dias + %) | Não |

---

## 3. Tela de Bolsas (Melhorias)

### Novas Colunas na Tabela
- **Desc. Matrícula** - Percentual de desconto na matrícula
- **Código** - Código para matrícula online

### Novo Campo no Modal
- **Código** (opcional) - Usado na matrícula online para aplicar a bolsa automaticamente

---

## 4. Arquivos

### Criar
```
inertia/pages/escola/administrativo/contratos/
├── index.tsx                    # Listagem
├── novo.tsx                     # Criar contrato
└── [id].tsx                     # Editar contrato

inertia/containers/contracts/
├── contract-form.tsx            # Form compartilhado
├── contract-basic-info-tab.tsx  # Aba informações básicas
├── contract-payment-tab.tsx     # Aba pagamento
└── contract-fees-discounts-tab.tsx # Aba juros e descontos
```

### Modificar
```
inertia/containers/scholarships-table-container.tsx
inertia/containers/scholarships/new-scholarship-modal.tsx
inertia/containers/scholarships/edit-scholarship-modal.tsx
inertia/components/layouts/escola-layout.tsx (descomentar Bolsas)
```

### Rotas
```
GET  /escola/administrativo/contratos           # Listagem
GET  /escola/administrativo/contratos/novo      # Criar
GET  /escola/administrativo/contratos/:id       # Editar
```

---

## 5. APIs Existentes (não precisa criar)

- ✅ CRUD contratos (`/api/v1/contracts`)
- ✅ Payment days (`/api/v1/contracts/:id/payment-days`)
- ✅ Interest config (`/api/v1/contracts/:id/interest-config`)
- ✅ Early discounts (`/api/v1/contracts/:id/early-discounts`)
- ✅ CRUD bolsas (`/api/v1/scholarships`)
