# Ask Anuá — Sheet contextual no /escola

Data: 2026-05-16
Status: Aprovado (brainstorm)
Owner: Davi

## Resumo

Adicionar um trigger "Perguntar ao Anuá" no header de `/escola` que abre um Sheet lateral com o assistente de IA. O Sheet recebe contexto da tela (id da tela + filtros ativos do dashboard) e mostra prompts sugeridos contextualizados. Threads criadas pelo Sheet ficam isoladas da listagem de threads do `/escola/ia` (chat fullscreen).

Reutiliza toda a infra de AI existente (`AiChatPane`, `AiService`, `ChatScope`). Mudança mínima de schema (uma coluna nova em `AiThread`) e um novo campo opcional em `ChatScope`.

## Decisões já tomadas (brainstorm)

- **Trigger**: botão `Perguntar ao Anuá` no header (`EscolaLayout` topbar), ao lado dos toggles de visão completa/simplificada.
- **Contexto pro AI**: `screen='escola_dashboard'` + filtros ativos (período letivo, sub-período, curso, nível, turma) enviados no body de cada turno.
- **Persistência da thread**: continua na mesma sessão (sessionStorage por `schoolId`). Aba nova ou fechar aba = nova thread. Reload da mesma aba mantém.
- **Histórico no Sheet**: só a conversa atual + botão "nova conversa". Não replica sidebar de threads.
- **Prompts sugeridos**: contextualizados nos filtros ativos.
- **Header do Sheet**: title "Perguntar ao Anuá" + subtitle dinâmico ("Olhando: 2026 · 1º ano A" / "Visão geral da escola" quando sem filtros).
- **Fullscreen handoff**: não tem. Sheet salva a thread mas ela NÃO aparece em `/escola/ia`.
- **Approach de isolamento**: coluna nova `surface` em `AiThread` (`'page' | 'sheet'`).

## Arquitetura

### Backend

**Migration** `add_surface_to_ai_threads`:
- Coluna `surface text NOT NULL DEFAULT 'page'`.
- Backfill via default cobre threads existentes — todas viram `'page'` e continuam aparecendo em `/escola/ia`.
- Sem índice por enquanto (cardinalidade baixa, queries sempre combinadas com `user_id`).

**`AiThread` model**: atributo novo `declare surface: 'page' | 'sheet'`.

**`ChatScope`** (extender o tipo em `app/ai/chat_scope.ts`):
```ts
export type ChatScope = {
  // ...existing fields
  screen?: {
    id: string
    filters?: Record<string, string>
  }
}
```

**`chat_controller.ts`**:
- Aceita `screen` no body (junto com `threadId`, `persona`).
- Aceita `surface` no body (default `'page'` quando ausente — mantém compat com `/escola/ia`).
- Passa ambos pro `AiService.chat()`.

**`AiService.chat()`**:
- `loadOrCreateThread`: ao criar thread, propaga `surface` recebido.
- `buildPromptContext`: anexa `scope.screen` ao `SystemPromptContext`.
- Persona `gestor` (em `app/ai/personas.ts` ou equivalente): se `ctx.scope.screen` presente, anexa ao system prompt um parágrafo gerado dinamicamente. Formato exato:

  Quando `screen.id === 'escola_dashboard'` e `filters` vazio/ausente:
  > "O usuário está olhando o dashboard geral da escola, sem filtros aplicados. Quando ele perguntar 'a escola' ou usar termos genéricos, assuma o escopo de toda a escola."

  Quando `screen.id === 'escola_dashboard'` e há filtros (cada filtro presente vira uma linha labelizada por mapping fixo: `academicPeriodId → "período letivo"`, `subPeriodId → "etapa/sub-período"`, `courseId → "curso"`, `levelId → "nível"`, `classId → "turma"`):
  > "O usuário está olhando o dashboard da escola com os seguintes filtros aplicados agora: período letivo=2026, turma=1º ano A. Use esses filtros como contexto implícito — quando ele perguntar 'a turma', 'esse período', etc., assuma os valores acima. Ao chamar tools que aceitam esses parâmetros, passe os ids correspondentes salvo se ele pedir explicitamente outra coisa."

  IDs são passados raw no system prompt (modelo pode usar pra tool calls). Labelização (nome legível) só é usada no header do Sheet (frontend), não no system prompt — o model trabalha com ids.

**`list_threads_controller.ts`**:
- Adiciona `where('surface', 'page')` ao default query.
- Query param opcional `?surface=sheet` libera lookup explícito (não usado por enquanto, mas deixa porta aberta).

### Frontend

**Novo componente**: `inertia/containers/ai/ask-anua-sheet.tsx`
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `filters: TabFilterState`, `academicPeriods/courses/levels/classes` (pra labelizar filtros no header).
- Internamente:
  - sessionStorage key: `anua:ask-sheet:thread:${schoolId}`.
  - Lê thread atual ou gera novo UUID na primeira abertura.
  - Renderiza `<Sheet>` com `<SheetContent>` lateral à direita, `w-full sm:max-w-[560px]`.
  - Header customizado (não usa `SheetHeader` default — precisa do subtitle dinâmico e do botão `+`).
  - Body: `<AiChatPane hideHeader threadId={threadId} persona="gestor" isNewThread={...} screen={...} surface="sheet" />`.

**Botão no header**: adicionar em `inertia/components/layouts/escola-layout.tsx` (ou onde os toggles atuais vivem) um `<Button variant="outline" size="sm">` com ícone `Sparkles` e label `Perguntar ao Anuá`. Em telas `< sm`: só ícone (label `sr-only`) + tooltip "Perguntar ao Anuá" pra economizar espaço no topbar mobile. Estado de open vive na page (`/escola/index.tsx`) e é passado pro `AskAnuaSheet`.

**Visibilidade do botão**: mesma lógica de `canViewFinancialTab` no `/escola/index.tsx` atual — `roleName in ['SCHOOL_ADMIN', 'SCHOOL_CHAIN_DIRECTOR', 'SCHOOL_DIRECTOR']`. SCHOOL_TEACHER/TEACHER não veem (alinha com a persona `gestor` que assume escopo de escola inteira).

**Mudanças em `AiChatPane`**:
- Nova prop `hideHeader?: boolean` (default `false`). Quando `true`, não renderiza o `ChatHeader` interno.
- Nova prop `screen?: { id: string; filters?: Record<string, string> }` — passa no `body` do transport do `useChat`.
- Nova prop `surface?: 'page' | 'sheet'` (default `'page'`) — passa no `body` do transport.
- Nova prop `suggestions?: string[]` — sobrescreve prompts do `AiChatEmpty`.

**Mudanças em `AiChatEmpty`**:
- Nova prop `suggestions?: string[]`. Quando presente, substitui o default da persona.

**Função utilitária**: `inertia/lib/contextual-prompts.ts`
- `buildContextualPrompts(filters, labels): string[]` retorna array de prompts baseado em qual nível de filtro está setado:
  - **Nenhum filtro** (todos `'all'`): visão geral.
  - **Só período**: prompts no escopo do período.
  - **Período + curso**: prompts no escopo do curso.
  - **Período + curso + turma**: prompts no escopo da turma.
- `formatContextLabel(filters, labels): string`: produz o subtitle do header. Trunca em 50 chars.

### Data flow

```
[/escola page] ── filters state ──┐
                                   ▼
                          [AskAnuaSheet container]
                          - sessionStorage threadId
                          - formatContextLabel(filters)
                          - buildContextualPrompts(filters)
                                   │
                                   ▼
                          [AiChatPane hideHeader screen surface=sheet]
                                   │
                                   ▼ useChat body
              { threadId, persona: 'gestor',
                screen: { id: 'escola_dashboard', filters },
                surface: 'sheet' }
                                   │
                                   ▼
                          [chat_controller]
                          - reads screen, surface from body
                          - passes to AiService.chat()
                                   │
                                   ▼
                          [AiService]
                          - loadOrCreateThread propaga surface
                          - buildPromptContext anexa scope.screen
                          - persona 'gestor' system prompt usa scope.screen
                                   │
                                   ▼
                          [model streamText]
```

## Edge cases

1. **Filtros mudam mid-conversation**: cada `sendMessage` envia snapshot atual. AI vê filtros do TURNO atual no system prompt. Sem injection adicional ("filtros mudaram") — confiamos no model. Reavaliar se causar confusão na prática.

2. **Filtros `'all'`**: convertidos pra `undefined`/omitidos do `filters` object. System prompt só lista filtros presentes — evita ruído ("filtro: todos os cursos").

3. **Reload de aba**: sessionStorage sobrevive. Thread continua. Aba nova ou fechar = thread perdida (nova UUID na próxima abertura).

4. **Multi-school**: key do sessionStorage inclui `schoolId` — troca de escola não vaza thread.

5. **Permissão (frontend)**: botão visível só pra `SCHOOL_ADMIN | SCHOOL_CHAIN_DIRECTOR | SCHOOL_DIRECTOR`. SCHOOL_TEACHER não vê o botão.

6. **Permissão (backend)**: persona `'gestor'` no controller já bloqueia roles não-gestor. `scope.screen.filters.classId` é hint, NÃO autoriza — `denyIfClassOutOfScope` nas tools continua sendo o gate.

7. **Mobile**: Sheet usa `side="bottom"` com `h-[90vh]` em telas `< sm`; `side="right"` em desktop. Derivado por classe responsiva ou prop simples (a definir na implementação — fallback aceitável: sempre `side="right"` com `w-full sm:max-w-[560px]`).

8. **Streaming durante fechamento**: Sheet fechado durante streaming não cancela a request (`useChat` continua). Mensagem persistida no DB normalmente. Reabrir: `useChat` resume via `prepareReconnectToStreamRequest` existente.

9. **Regression em queries existentes de `AiThread`**: grep por `AiThread.query()` que lista threads pra confirmar que apenas `list_threads_controller` precisa do filtro `surface='page'`. Outras queries (load by id) não precisam — id já é único.

## Segurança

- `screen.id` e `screen.filters` são untrusted (body). Backend NÃO usa pra autorização.
- `ChatScope.classIds/studentIds/...` (calculados no banco a partir do `userId`) continuam sendo a fonte de verdade. Tools recebem `scope` e validam.
- Se body envia `filters.classId = "Y"` (turma de outra escola), o system prompt mencionará Y, mas qualquer tool call usando Y será negada por `denyIfClassOutOfScope`. O pior caso é o AI dar uma resposta vazia/confusa — não vazamento.

## Testing

### Backend
- Unit: `AiService.chat()` com `scope.screen` injeta context no `system` arg do `streamText` (mock model).
- Unit: persona `gestor` system prompt sem `scope.screen` é idêntico ao baseline.
- Integration: `POST /api/v1/ai/chat` com `body.surface='sheet'` cria thread com `surface='sheet'`.
- Integration: `GET /api/v1/ai/threads` (default) NÃO retorna threads `surface='sheet'`.
- Integration: `GET /api/v1/ai/threads?surface=sheet` retorna sheet threads.
- Segurança: `body.screen.filters.classId` de outra escola não vaza dados via tools.

### Frontend
- Unit: `formatContextLabel` retorna strings esperadas para 5 combinações (nenhum / período / período+curso / período+curso+nível / tudo).
- Unit: `buildContextualPrompts` retorna prompt sets diferentes por nível de filtro.
- Component: `AskAnuaSheet` empty state mostra prompts contextualizados quando `classId` setado.

### Manual E2E
1. Abrir `/escola` como SCHOOL_DIRECTOR.
2. Botão "Perguntar ao Anuá" aparece no header.
3. Click → Sheet abre, empty state com prompts gerais.
4. Filtrar pra uma turma. Click prompt sugerido. AI responde no contexto da turma.
5. Fechar Sheet. Mudar filtro pra outra turma. Reabrir Sheet → mesma thread visível.
6. Mandar nova pergunta → AI usa nova turma no contexto.
7. Click `+` → nova conversa, empty state de volta.
8. Recarregar aba → thread mantida (sessionStorage).
9. Fechar aba, abrir nova aba → thread nova.
10. Como SCHOOL_TEACHER: botão não aparece.
11. Em `/escola/ia`: threads do Sheet NÃO aparecem na lista.

## Out of scope (V2)

- Sheet em outras telas (`/escola/financeiro`, `/escola/pedagogico`, `/escola/turmas/[id]`).
- Persona não-gestor no Sheet.
- Fullscreen handoff (`Sheet → /escola/ia` carregando a thread).
- Marcar/favoritar conversa do Sheet pra "promover" pro /escola/ia.
- Lista de Sheet threads em algum lugar (settings, debug, etc.).
- Telemetria de qual filtro está ativo quando a thread é criada (úteis pra entender uso).

## Arquivos esperados (estimativa)

**Novos**:
- `database/migrations/<timestamp>_add_surface_to_ai_threads.ts`
- `inertia/containers/ai/ask-anua-sheet.tsx`
- `inertia/lib/contextual-prompts.ts`
- Testes correspondentes.

**Modificados**:
- `app/models/ai_thread.ts` — coluna `surface`.
- `app/ai/chat_scope.ts` — campo `screen`.
- `app/ai/ai_service.ts` — propaga `surface` e `screen`.
- `app/ai/personas.ts` (ou equivalente) — system prompt do gestor lê `scope.screen`.
- `app/controllers/ai/chat_controller.ts` — aceita `screen` e `surface` do body.
- `app/controllers/ai/list_threads_controller.ts` — filtra `surface='page'`.
- `inertia/components/ai/ai-chat-pane.tsx` — props `hideHeader`, `screen`, `surface`, `suggestions`.
- `inertia/components/ai/ai-chat-empty.tsx` — prop `suggestions`.
- `inertia/components/layouts/escola-layout.tsx` (ou onde topbar dos toggles vive) — botão de trigger.
- `inertia/pages/escola/index.tsx` — estado do Sheet, integração com filtros.
