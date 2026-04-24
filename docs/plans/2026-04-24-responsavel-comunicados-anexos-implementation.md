# Responsavel Comunicados Anexos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir que o responsavel abra anexos diretamente na listagem de comunicados.

**Architecture:** Reaproveitar o contrato atual da API de comunicados (que ja inclui `attachments` com `fileUrl`) e adicionar renderizacao de anexos no card da listagem. Proteger contra dados incompletos via fallback de `fileUrl` nulo, sem alterar fluxo de ciencia nem rotas.

**Tech Stack:** AdonisJS, Inertia React, TypeScript, Lucide React, Japa API client.

---

### Task 1: Garantir contrato de anexos na API de responsavel

**Files:**
- Modify: `tests/functional/responsavel/comunicados_api.spec.ts`

**Step 1: Write the failing test**

Adicionar um teste no grupo `Responsavel comunicados API` que:
- cria comunicado publicado para responsavel,
- cria um registro em `SchoolAnnouncementAttachment` para esse comunicado,
- chama `GET /api/v1/responsavel/comunicados` autenticado,
- valida que `body.data[0].attachments` existe com item contendo `fileName` e `fileUrl`.

Exemplo de assercoes esperadas:

```ts
assert.isArray(body.data[0].attachments)
assert.equal(body.data[0].attachments[0].fileName, 'boletim.pdf')
assert.isString(body.data[0].attachments[0].fileUrl)
```

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/functional/responsavel/comunicados_api.spec.ts -t "includes attachments"`

Expected: FAIL inicialmente caso fixture/assert esteja incorreta.

**Step 3: Write minimal implementation**

Se o teste falhar por serializacao, ajustar somente o necessario no backend (preferencialmente em `app/controllers/responsavel/list_comunicados_controller.ts` ou transformer relacionado) para garantir `attachments` no payload da listagem.

**Step 4: Run test to verify it passes**

Run: `pnpm test --files tests/functional/responsavel/comunicados_api.spec.ts -t "includes attachments"`

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/functional/responsavel/comunicados_api.spec.ts app/controllers/responsavel/list_comunicados_controller.ts app/transformers/school_announcement_transformer.ts app/transformers/school_announcement_attachment_transformer.ts
git commit -m "test(responsavel): ensure comunicados list includes attachment links"
```

### Task 2: Renderizar anexos na pagina do responsavel

**Files:**
- Modify: `inertia/pages/responsavel/comunicados.tsx`

**Step 1: Write the failing test**

Adicionar um teste de comportamento no arquivo de teste React da pagina (criar se nao existir) cobrindo:
- exibe secao `Anexos` quando `attachments` existe,
- renderiza link `Abrir` para cada anexo com `target="_blank"`,
- mostra `Arquivo indisponivel` quando `fileUrl` for nulo.

Se o projeto ainda nao tiver harness de teste React para essa pagina, documentar esse gap no commit e seguir com validacao por typecheck + teste manual.

**Step 2: Run test to verify it fails**

Run: comando de teste frontend existente no projeto para esse arquivo.

Expected: FAIL antes da implementacao.

**Step 3: Write minimal implementation**

Em `inertia/pages/responsavel/comunicados.tsx`:
- expandir `AnnouncementItem` com:

```ts
attachments?: Array<{ id: string; fileName: string; fileUrl?: string | null }>
```

- importar `Paperclip` de `lucide-react`.
- abaixo de `announcement.body`, renderizar bloco condicional de anexos.
- para cada anexo:
  - mostrar nome do arquivo,
  - se `fileUrl`, renderizar `<a href=... target="_blank" rel="noopener noreferrer">Abrir</a>`;
  - se nao, renderizar label `Arquivo indisponivel`.

**Step 4: Run verification**

Run: `pnpm run typecheck`

Expected: PASS.

**Step 5: Manual verification**

Validar em `https://anuaapp.com.br/responsavel/comunicados?aluno=cleiton-filho-019c05ed`:
- comunicado com anexos mostra links,
- clique abre arquivo,
- comunicado sem anexo nao mostra secao.

**Step 6: Commit**

```bash
git add inertia/pages/responsavel/comunicados.tsx
git commit -m "feat(responsavel): show announcement attachments in list cards"
```

### Task 3: Validacao final e deploy

**Files:**
- No file changes required

**Step 1: Run focused backend test suite**

Run: `pnpm test --files tests/functional/responsavel/comunicados_api.spec.ts`

Expected: PASS.

**Step 2: Run global typecheck**

Run: `pnpm run typecheck`

Expected: PASS.

**Step 3: Push and monitor deploy**

Run:

```bash
git push
```

Verificar status do deploy (GitHub Actions + Cloud Run revisao pronta).

**Step 4: Smoke test em producao**

- abrir rota de responsavel,
- abrir ao menos um anexo,
- confirmar que fluxo de `Li e estou ciente` continua funcionando.

**Step 5: Commit (se houver ajuste final de smoke test)**

```bash
git add <arquivos-ajustados>
git commit -m "fix(responsavel): polish attachments listing behavior"
```
