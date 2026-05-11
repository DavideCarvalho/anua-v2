# Design Doc: Layout Simplificado — Fase 2 (Bolsas, Horários, Inadimplência)

## Contexto

A Fase 1 entregou visão simplificada para 6 módulos principais da Escola (Alunos, Turmas, Calendário, Financeiro/Faturas, Cantina/PDV, Comunicados). O modo simplificado — acionado por toggle global — substitui o layout completo por uma experiência enxuta de "ação + lista básica" usando os componentes `EscolaLayoutSimplificado`, `SimplifiedPageShell` e `SimplifiedBasicList`.

Com base em dados reais de pageviews dos últimos 90 dias (PostHog), as 3 páginas mais acessadas que **ainda não têm** visão simplificada são:

| # | Página | Rota | Pageviews (90d) |
|---|--------|------|-----------------:|
| 1 | Bolsas | `/escola/administrativo/bolsas` | 501 |
| 2 | Horários | `/escola/pedagogico/horarios` | 209 |
| 3 | Inadimplência | `/escola/financeiro/inadimplencia` | 172 |

**Escopo**: apenas área Escola. Outras áreas (responsável, aluno, admin, loja) seguem sem modo simplificado.

---

## Objetivos

- Levar a visão simplificada para as 3 páginas operacionais mais acessadas que ainda não a possuem.
- Seguir o mesmo padrão arquitetural da Fase 1: toggle global, layout `EscolaLayoutSimplificado`, shell `SimplifiedPageShell`, lista básica.
- Não reescrever lógica de dados — apenas apresentação simplificada.
- Manter reversibilidade imediata para o modo completo.

## Fora de Escopo (Fase 2)

- Páginas de detalhe/edição (ex.: editar bolsa, editar aluno inadimplente).
- Reescrever containers de dados existentes.
- Novos componentes de UI além dos já estabelecidos na Fase 1.
- Áreas diferentes de Escola.

---

## Arquitetura Técnica (padrão Fase 1)

### Contrato por página

Toda página segue o mesmo contrato estabelecido na Fase 1:

```tsx
// 1. Estado global de viewMode
const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')

useEffect(() => {
  setViewMode(readEscolaDashboardViewMode(user?.id))
}, [user?.id])

const onViewModeChange = (mode: EscolaDashboardViewMode) => {
  setViewMode(mode)
  writeEscolaDashboardViewMode(user?.id, mode)
}

// 2. Toggle reutilizável no topo (full page e simplified page)
const viewModeToggle = (
  <>
    <Button variant={viewMode === 'full' ? 'default' : 'outline'} onClick={() => onViewModeChange('full')}>
      Visão completa
    </Button>
    <Button variant={viewMode === 'simple' ? 'default' : 'outline'} onClick={() => onViewModeChange('simple')}>
      Visão simplificada
    </Button>
  </>
)

// 3. Branch condicional
if (viewMode === 'simple') {
  return <EscolaLayoutSimplificado ...> <SimplifiedPageShell ...> <SimplifiedBasicList> ... </> </> </>
}

return <EscolaLayout topbarActions={viewModeToggle}> ...conteúdo completo... </>
```

### Componentes reutilizados

| Componente | Caminho | Função |
|---|---|---|
| `EscolaLayoutSimplificado` | `components/layouts/escola-layout-simplificado.tsx` | Layout mínimo com header + toggle |
| `SimplifiedPageShell` | `components/escola/simplified-page-shell.tsx` | Shell com título, descrição, ações primárias |
| `SimplifiedBasicList` | `components/escola/simplified-basic-list.tsx` | Wrapper de lista com estados vazio/loading/erro |

### Persistência

- `readEscolaDashboardViewMode(userId)` → lê de `localStorage`
- `writeEscolaDashboardViewMode(userId, mode)` → escreve em `localStorage`
- Chave: `escola:dashboard:view-mode:{userId}`
- Definido em `inertia/lib/escola-dashboard-view-mode.ts`

---

## Página 1: Bolsas (`/escola/administrativo/bolsas`)

### Situação atual

Página simples (43 linhas). Renderiza `ScholarshipsTableContainer` com tabela paginada, filtros (busca por nome, toggle ativo/inativo) e botão "Nova bolsa". Modais de criação e edição são controlados por estado local.

### Visão simplificada proposta

- **Título**: "Bolsas"
- **Descrição**: "Gerencie os tipos de bolsa e descontos da escola."
- **Ações primárias**: `[Nova bolsa]` `[Atualizar lista]`
- **Lista básica**: tabela com colunas essenciais apenas:
  - `Nome` — nome da bolsa
  - `Desconto` — percentual formatado (ex.: "15%")
  - `Ativa` — badge Sim/Não
  - `Ação` — botão `...` (dropdown com Editar)
- **Ordenação**: alfabética por nome
- **Sem**: filtros de busca, toggle ativo/inativo, paginação complexa

### Comportamento

| Estado | Comportamento |
|---|---|
| Loading | Skeleton de 3 linhas |
| Empty | "Nenhuma bolsa cadastrada" + CTA "Nova bolsa" |
| Erro | Card com mensagem + botão "Tentar novamente" |

### Implementação

- **Arquivo**: `inertia/pages/escola/administrativo/bolsas.tsx` (modificar)
- **Container**: reutilizar `ScholarshipsTableContainer` já existente (ele é responsivo e funciona com qualquer wrapper)
- **Não criar** novo container dedicado — o container atual já é suficientemente simples

---

## Página 2: Horários (`/escola/pedagogico/horarios`)

### Situação atual

Página complexa (375 linhas). Fluxo em dois passos: (1) selecionar Período Letivo + Turma, (2) visualizar grade de horários com drag-and-drop (`ScheduleGrid`, 1516 linhas) ou configurar parâmetros da grade (`ScheduleConfigForm`). Usa `@dnd-kit` para reordenar aulas, React Query para dados.

### Visão simplificada proposta

A simplificação aqui é **substancial** — o drag-and-drop e o config form são removidos, deixando apenas a grade em modo somente leitura:

- **Título**: "Horários"
- **Descrição**: "Visualize os horários de cada turma de forma rápida."
- **Ações primárias**: _nenhuma ação primária_ (a grade é só visualização)
- **Seletores** (mantidos, simplificados): Período Letivo + Turma (idênticos ao modo completo)
- **Grade**: `ScheduleGrid` em modo **read-only** (sem drag-and-drop)
  - Para isso, adicionar prop `readOnly?: boolean` ao `ScheduleGrid`
  - Quando `readOnly=true`: desabilitar sensores do `@dnd-kit`, esconder botões de edição/exclusão de slots
- **Sem**: `ScheduleConfigForm`, botão "Reconfigurar Grade", drag-and-drop

### Comportamento

| Estado | Comportamento |
|---|---|
| Sem seleção | Card amarelo "Selecione uma turma e um período letivo" |
| Loading (seletores) | Selects desabilitados com "Carregando..." |
| Loading (grade) | Skeleton da grade |
| Empty (sem horários) | "Nenhum horário configurado para esta turma" + link "Configurar na visão completa" |
| Erro | Card com mensagem + botão "Tentar novamente" |

### Implementação

- **Arquivo**: `inertia/pages/escola/pedagogico/horarios.tsx` (modificar)
- **Arquivo**: `inertia/containers/schedule/schedule-grid.tsx` (adicionar prop `readOnly`)
- **Branch simplificado**: manter seletores, remover `ScheduleConfigForm`, renderizar `<ScheduleGrid readOnly />`

---

## Página 3: Inadimplência (`/escola/financeiro/inadimplencia`)

### Situação atual

Página mínima (20 linhas). Renderiza `StudentPaymentsContainer` com `status="OVERDUE"` e `showSearch={false}`. O container é complexo (551 linhas) com filtros avançados (período, turma, status, busca), tabela paginada, ações por linha (dropdown).

### Visão simplificada proposta

- **Título**: "Inadimplência"
- **Descrição**: "Acompanhe alunos com pagamentos em atraso e tome ações rápidas."
- **Ações primárias**: `[Atualizar lista]` `[Ver faturas]`
- **Lista básica**: tabela com colunas essenciais:
  - `Aluno` — nome do aluno
  - `Turma` — turma atual
  - `Valor em atraso` — soma dos valores pendentes/vencidos
  - `Dias de atraso` — quantidade de dias (badge vermelho se >30)
  - `Ação` — botão `...` (dropdown: Ver detalhes, Negociar)
- **Ordenação**: dias de atraso decrescente (mais urgente primeiro)
- **Sem**: filtros de período/turma/status/busca

### Comportamento

| Estado | Comportamento |
|---|---|
| Loading | Skeleton de 5 linhas |
| Empty | "Nenhum aluno com pagamento em atraso" |
| Erro | Card com mensagem + botão "Tentar novamente" |

### Implementação

- **Arquivo**: `inertia/pages/escola/financeiro/inadimplencia.tsx` (modificar)
- **Container**: reutilizar `StudentPaymentsContainer` com `status="OVERDUE"` e `showSearch={false}` (igual ao modo completo)
- **Não criar** novo container dedicado — o container atual é parametrizável

---

## Decisões de Produto

- **Não criar containers simplificados dedicados** para Bolsas e Inadimplência. Os containers existentes (`ScholarshipsTableContainer`, `StudentPaymentsContainer`) são reutilizados dentro do shell simplificado. Isso evita duplicação de lógica de dados.
- **Horários é a exceção**: requer alteração no `ScheduleGrid` (prop `readOnly`) porque o drag-and-drop é inerentemente complexo e não faz sentido no modo simplificado.
- **Prioridade**: implementar na ordem Bolsas → Inadimplência → Horários (complexidade crescente).

---

## Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| `ScheduleGrid` (1516 linhas) pode ser frágil ao receber prop `readOnly` | Testar exaustivamente no modo readOnly; fallback: não renderizar o grid simplificado e mostrar link para visão completa |
| `StudentPaymentsContainer` pode não ter todos os estados (empty/loading/error) cobertos no shell simplificado | Testar cada estado isoladamente |
| Regressão no modo completo das 3 páginas | Suite de testes browser existente cobre toggle e modo completo |

---

## Testes

### Browser/E2E

- Toggle alterna entre visão completa e simplificada em cada uma das 3 páginas.
- Visão simplificada de Bolsas mostra tabela com colunas mínimas e botão "Nova bolsa".
- Visão simplificada de Horários mostra seletores + grade read-only (sem drag).
- Visão simplificada de Inadimplência mostra lista de alunos inadimplentes ordenada por dias de atraso.
- Persistência do viewMode entre navegações.

### Regressão

- Modo completo das 3 páginas permanece inalterado.
- Rotas e permissões continuam as mesmas.
- Navegação entre páginas não quebra o estado do toggle.

---

## Rollout

- **Fase 2**: 3 páginas (Bolsas, Horários, Inadimplência) com layout simplificado.
- Após deploy, medir adoção do modo simplificado nestas páginas via PostHog.
- **Fase 3** (futuro): avaliar Cardápio, Lojas, Contratos e demais páginas conforme dados de uso.
