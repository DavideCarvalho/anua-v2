# Plano: AskAnua pro /responsavel

**Data:** 2026-05-20
**Status:** Aprovado, aguardando execução
**Origem:** Conversa com Davi após shipar AskAnua nas 5 tabs de turma (commits `84bc6c33..c23fc048`)

## Goal

Levar o chat contextual da Anuá pros pais nas 5 rotas mais usadas do `/responsavel`. Dados do PostHog mostram que pais são a audiência **mais larga** da plataforma — `/responsavel` tem 10 pais distintos vs ~2 na maior rota da escola.

## Por que vale

- **Audiência:** 10 pais distintos só na landing; 7 em atividades/comunicados/registro-diario
- **Hábito:** retornos consistentes em horário noturno e fim de semana (uso pós-escola)
- **Infra pronta:** persona `responsavel` já existe no backend com scope restrito por filho (`studentIds`, com subsets pedagógico/financeiro)

## Decisões (alinhadas com Davi)

| # | Decisão | Justificativa |
|---|---|---|
| 1 | **Surfaces:** 5 rotas (`/responsavel`, `/atividades`, `/comunicados`, `/calendario`, `/registro-diario`) | Cobrir o cluster de maior tráfego de pai |
| 2 | **Tools:** só leitura — sem write | Tirar fricção operacional ("avisa a escola" precisa de fluxo de aprovação que não temos) |
| 3 | **Multi-filho:** default escopo "todos os filhos" | Família com 1 filho (caso comum) sem fricção; pai narrowa por nome quando precisa |
| 4 | **Tom:** dois modos — `compact` (mobile/sheet bottom) e `full` (desktop/inline) | Pai checa rápido no celular à noite; gráficos atrapalham. Desktop pode ter tabelas |
| 5 | **Gate role:** diferenciar `studentIdsPedagogical` vs `studentIdsFinancial` | Pai só-financeiro NÃO vê tools pedagógicas e vice-versa. Já existe `denyIfResponsavelLacksPedagogicalAccess` no scope_check; persona prompt precisa explicar amigável |

## Plano técnico (5 fases atomáveis)

### Fase 1 — Backend: persona + tools + screen ids

- Auditar registry: confirmar que `responsavel` tem `getMyChildren`, `getStudentGrades`, `getStudentAttendance`, `getStudentFinancials`, `getCommunications`. Adicionar o que faltar.
- 5 screen ids novos no validator (`app/validators/ai.ts`):
  - `responsavel_dashboard`
  - `responsavel_atividades`
  - `responsavel_comunicados`
  - `responsavel_calendario`
  - `responsavel_registro_diario`
- SCREEN_LABELS pra cada um em `app/ai/personas.ts`

### Fase 2 — Backend: modo compact vs full

- `ChatScope.screen` ganha campo `mode: 'compact' | 'full'` (default `full`)
- `renderScreenContext` em `personas.ts` injeta instrução extra no system prompt baseado no mode:
  - `compact`: "Responda em parágrafos curtos. Não use tabelas nem gráficos. Resuma em até 3 itens. NÃO chame renderResult."
  - `full`: comportamento atual (renderResult OK)
- Validator do `screen` aceita o campo `mode`

### Fase 3 — Frontend: hook + suggestions

- Novo `useResponsavelAskAnuaContext({ screenId, mode, selectedChildId? })` em `inertia/lib/ask-anua-context.ts`
- Suggestions por rota:
  - Landing: "Como foi a semana do meu filho?", "Próximas provas e atividades"
  - Atividades: "Quais atividades estão atrasadas?", "Próximas entregas"
  - Comunicados: "Tem comunicado novo?", "Algum aviso urgente?"
  - Calendario: "O que tem essa semana?", "Próximos eventos da turma"
  - Registro-diario: "Como foi o dia do meu filho hoje?"
- contextLabel: "Todos os filhos" ou "[Nome] · [tab]" quando filho selecionado

### Fase 4 — Frontend: ResponsavelLayout wire

- Confirmar que existe um `ResponsavelLayout` (vi `inertia/components/layouts/responsavel-layout.tsx` no codebase). Estender props com `screenId`.
- Mesmo padrão de `TurmaLayout` (commit `573a1752`): botão topbar + AskAnuaSheet mobile + AskAnuaPanel inline desktop
- `mode` derivado de `useIsMobile()`: mobile=compact, desktop=full

### Fase 5 — Frontend: wire das 5 páginas leaf

- Cada rota leaf passa `screenId` específico ao `ResponsavelLayout`
- Verificar que cada uma recebe IDs do filho/turma do controller; ajustar se necessário

## Riscos / opens

1. **renderResult no compact** — a tool é registrada globalmente; em compact deveria ser inibida. Confirmar se o prompt "NÃO chame renderResult" é suficiente, ou se precisa filtrar do registry quando `mode==='compact'`. Risco médio.
2. **Custo de token** — pais usam ~10x mais que gestores; conversa cresce custo. Considerar:
   - Feature flag pra rollout gradual (5% dos pais primeiro)
   - Limite diário por user (ex: 20 mensagens/dia/pai)
   - Decidir antes do ship ou após observar uso?
3. **Pai responsavel só-financeiro pergunta sobre nota** — `denyIfResponsavelLacksPedagogicalAccess` já retorna mensagem. Validar UX: o modelo recebe a mensagem como tool-result, deve explicar amigavelmente ao pai ("Notas e frequência ficam com o responsável pedagógico do João — geralmente o pai/mãe que assinou a parte pedagógica na matrícula"). Testar com cenário real.
4. **Onboarding** — primeiro contato com o botão. Adicionar tooltip "Pergunte sobre seu filho" ou banner contextual? Provavelmente nice-to-have, não bloqueia ship.
5. **Pai com filhos em escolas diferentes** — `chatScope` é por `schoolId` (única escola). Se o pai tem João na Escola A e Maria na Escola B, ele tem que trocar de escola pra perguntar de cada um. Pode confundir. Validar com produto: cenário existe? frequente?

## Estimativa

- Backend: 2-3h (mais sutil que escola por causa do mode `compact`)
- Frontend: 3-4h (5 páginas + layout + suggestions)
- Testes E2E (impersonando responsavel pedagógico e só-financeiro): 1h
- **Total: ~meio dia + folga**

## Não-objetivos (out of scope desse plano)

- Tools de escrita (avisar falta, marcar reunião, etc.) — decisão #2
- Persistência de modo escolhido pelo usuário (sempre derivado do breakpoint)
- AI no `/aluno` (gamificação) — outra audiência, outro plano
- Notificações push proativas do Anuá pro pai — futuro

## Referências

- PostHog query: top rotas /responsavel em maio/26 (10 pais na landing)
- Pattern de turma como exemplo: commits `84bc6c33..c23fc048`
- `denyIfResponsavelLacksPedagogicalAccess`: `app/ai/scope_check.ts:38`
- `ResponsavelLayout`: `inertia/components/layouts/responsavel-layout.tsx`

---

**Próximo passo:** sessão nova, executar fase 1.
