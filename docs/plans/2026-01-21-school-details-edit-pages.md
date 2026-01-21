# Design: Páginas de Detalhes e Edição de Escola

**Data:** 2026-01-21
**Status:** Aprovado

## Resumo

Criar páginas dedicadas para visualização de detalhes e edição de escolas, substituindo o modal de edição atual que é limitado e não vem populado com os dados.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/admin/escolas/:id` | Página de detalhes (visualização) |
| `/admin/escolas/:id/editar` | Página de edição (formulário com abas) |

## Fluxos de Navegação

```
Lista de Escolas (/admin/escolas)
    │
    ├── Clique em "Editar" ──────────► Página de Edição (/admin/escolas/:id/editar)
    │                                         │
    │                                         └── Salvar ──► Lista + Toast sucesso
    │
    └── Clique no nome da escola ───► Página de Detalhes (/admin/escolas/:id)
                                              │
                                              └── Clique em "Editar" ──► Página de Edição
```

## Página de Detalhes (`/admin/escolas/:id`)

### Layout

Card principal com header + grid de informações + seções colapsáveis

### Header
- Nome da escola (título)
- Badge de status (Ativa/Inativa)
- Botões: "Editar" (primary), "Voltar" (outline)

### Grid de Informações Básicas (2-3 colunas)
- Slug
- CNPJ (formatado)
- Rede de ensino (se pertencer a uma)
- Data de criação

### Seção: Endereço
- Endereço completo formatado (Rua X, 123 - Bairro - Cidade/UF - CEP)
- Link para Google Maps (se tiver coordenadas)

### Seção: Configurações Acadêmicas
- Nota mínima para aprovação
- Frequência mínima (%)
- Algoritmo de cálculo (Média/Soma)

### Seção: Seguro de Inadimplência
- Status (Ativo/Inativo)
- Se ativo: percentual, cobertura, dias para acionar

### Seção: Usuários Vinculados (tabela simples)
- Colunas: Nome, Email, Cargo/Role
- Limite de 10 usuários com "Ver todos" se houver mais
- Botão de impersonar ao lado de cada usuário

### Seção: Métricas (cards pequenos)
- Total de alunos ativos
- Status da assinatura (Trial/Ativa/Expirada)
- Dias restantes de trial (se aplicável)

## Página de Edição (`/admin/escolas/:id/editar`)

### Layout

Header fixo + Tabs com conteúdo

### Header
- Título: "Editar Escola"
- Subtítulo: Nome atual da escola
- Botões: "Cancelar" (volta para lista), "Salvar" (submit do form)

### Abas

#### 1. Dados Básicos
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome da escola | Input text | Sim |
| Slug | Input text (validação formato) | Sim |
| CNPJ | MaskedInput `00.000.000/0000-00` | Não |
| Logo | Upload imagem com preview | Não |

#### 2. Endereço
| Campo | Tipo | Comportamento |
|-------|------|---------------|
| CEP | MaskedInput `00000-000` | Auto-preenche via BrasilAPI |
| Rua | Input text | Preenchido automaticamente |
| Número | Input text | Manual |
| Complemento | Input text | Opcional |
| Bairro | Input text | Preenchido automaticamente |
| Cidade | Input text | Preenchido automaticamente |
| Estado | Input text (2 chars) | Preenchido automaticamente |

#### 3. Acadêmico
| Campo | Tipo | Default |
|-------|------|---------|
| Nota mínima | Input numérico | 7.0 |
| Frequência mínima % | Input numérico | 75 |
| Algoritmo de cálculo | Select (Média/Soma) | Média |

#### 4. Seguro
| Campo | Tipo | Condição |
|-------|------|----------|
| Habilitar seguro | Checkbox | - |
| Percentual do seguro | Input % (min 3%) | Se habilitado |
| Cobertura | Input % (default 100%) | Se habilitado |
| Dias para acionar | Input numérico (default 90) | Se habilitado |

### Comportamento
- Form state único compartilhado entre todas as abas
- Validação apenas no submit
- Loading state no botão Salvar durante requisição

## API

### GET `/api/v1/schools/:id`

Retorna escola com todos os campos necessários para edição e métricas para detalhes.

### PUT `/api/v1/schools/:id`

**Payload:**
```typescript
{
  name: string
  slug: string
  cnpj?: string
  logoUrl?: string
  // Endereço
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  latitude?: number
  longitude?: number
  // Acadêmico
  minimumGrade?: number
  minimumAttendancePercentage?: number
  calculationAlgorithm?: 'AVERAGE' | 'SUM'
  // Seguro
  hasInsurance?: boolean
  insurancePercentage?: number
  insuranceCoveragePercentage?: number
  insuranceClaimWaitingDays?: number
}
```

### Tratamento de Erros
- Slug duplicado → erro específico com mensagem clara
- Validação de campos → erros inline por campo
- Erro de rede → toast de erro genérico

### Cache
- Invalidar `['school', id]` e `['schools']` após sucesso

## Arquivos

### Novos

```
inertia/pages/admin/escolas/[id].tsx
inertia/pages/admin/escolas/[id]/editar.tsx
inertia/containers/schools/school-details.tsx
inertia/containers/schools/school-edit-form.tsx
inertia/containers/schools/school-edit-schema.ts
app/controllers/pages/admin/show_school_details_page_controller.ts
app/controllers/pages/admin/show_edit_school_page_controller.ts
```

### Modificar

```
start/routes.ts
app/controllers/schools/update_controller.ts
app/validators/school.ts
inertia/pages/admin/escolas.tsx
inertia/hooks/queries/use-schools.ts
```

### Reutilizar

- `MaskedInput` (CNPJ e CEP)
- Componentes UI existentes (Card, Tabs, Form, Input, Select, Checkbox)
- Lógica de CEP da página de onboarding
