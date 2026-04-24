# Responsavel Comunicados Unified Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar preview in-app unificado para anexos de comunicados do responsavel (imagem, PDF e fallback) em modal fullscreen com fundo escuro.

**Architecture:** Criar um componente de lightbox reutilizavel no frontend Inertia que recebe uma lista de arquivos e decide o renderer por tipo de arquivo. Integrar esse componente na pagina de comunicados do responsavel, substituindo o comportamento atual de abrir nova aba. Reaproveitar o contrato atual de API (`attachments` com `fileName`, `fileUrl`, `mimeType` quando disponivel) sem alteracao de endpoint.

**Tech Stack:** React 19, TypeScript, Inertia, componentes UI internos (`Dialog`), Lucide React, Japa (backend tests).

---

### Task 1: Garantir contrato de anexos para preview no endpoint de responsavel

**Files:**
- Modify: `tests/functional/responsavel/comunicados_api.spec.ts`
- Optional modify (somente se teste falhar): `app/controllers/responsavel/list_comunicados_controller.ts`
- Optional modify (somente se teste falhar): `app/transformers/school_announcement_attachment_transformer.ts`

**Step 1: Write the failing test**

Adicionar teste cobrindo que a listagem de comunicados retorna anexos com campos necessarios para preview unificado:
- `id`
- `fileName`
- `fileUrl` (campo presente, podendo ser `null`)

Exemplo de assercoes:

```ts
assert.isArray(body.data[0].attachments)
assert.equal(body.data[0].attachments[0].fileName, 'boletim.pdf')
assert.isTrue('fileUrl' in body.data[0].attachments[0])
```

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/functional/responsavel/comunicados_api.spec.ts -t "lists only published comunicados for authenticated responsible"`

Expected: FAIL se o contrato nao estiver consistente.

**Step 3: Write minimal implementation**

Se necessario, ajustar serializacao em:
- `app/controllers/responsavel/list_comunicados_controller.ts`
- `app/transformers/school_announcement_attachment_transformer.ts`

para garantir payload adequado de anexos.

**Step 4: Run test to verify it passes**

Run: `pnpm test --files tests/functional/responsavel/comunicados_api.spec.ts -t "lists only published comunicados for authenticated responsible"`

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/functional/responsavel/comunicados_api.spec.ts app/controllers/responsavel/list_comunicados_controller.ts app/transformers/school_announcement_attachment_transformer.ts
git commit -m "test(responsavel): lock attachments contract for in-app preview"
```

### Task 2: Implementar componente de preview unificado (modal unico)

**Files:**
- Create: `inertia/components/ui/file-preview-lightbox.tsx`
- Modify (se necessario para utilitarios): `inertia/lib/utils.ts`

**Step 1: Write the failing test**

Criar teste do componente (no padrao existente do projeto) cobrindo:
- renderiza imagem quando arquivo e `image/*`
- renderiza `iframe` quando arquivo e PDF
- renderiza fallback quando tipo e desconhecido ou URL ausente
- navegacao `ArrowLeft`/`ArrowRight` e fechamento com `Escape`

**Step 2: Run test to verify it fails**

Run: comando de teste frontend disponivel para o arquivo criado.

Expected: FAIL antes da implementacao.

**Step 3: Write minimal implementation**

Implementar `FilePreviewLightbox` com API:

```ts
type PreviewFile = {
  id: string
  fileName: string
  fileUrl?: string | null
  mimeType?: string | null
}
```

Comportamento:
- `Dialog` fullscreen com overlay escuro.
- Header: nome arquivo + contador + botoes anterior/proximo/baixar/fechar.
- Body:
  - imagem: `<img className="object-contain ..." />`
  - PDF: `<iframe ... />`
  - fallback: mensagem + botoes `Abrir` e `Baixar`.

**Step 4: Run test to verify it passes**

Run: comando de teste frontend do componente.

Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/components/ui/file-preview-lightbox.tsx inertia/lib/utils.ts
git commit -m "feat(ui): add unified file preview lightbox for images and pdfs"
```

### Task 3: Integrar lightbox na pagina de comunicados do responsavel

**Files:**
- Modify: `inertia/pages/responsavel/comunicados.tsx`

**Step 1: Write the failing test**

Adicionar teste da pagina cobrindo:
- clique em anexo abre modal (em vez de nova aba)
- navegacao entre anexos no mesmo modal
- imagem e PDF renderizam com o mesmo overlay escuro

**Step 2: Run test to verify it fails**

Run: comando de teste frontend para a pagina.

Expected: FAIL antes da integracao.

**Step 3: Write minimal implementation**

Em `inertia/pages/responsavel/comunicados.tsx`:
- adicionar estado do modal (`open`, `files`, `initialIndex`)
- trocar links externos por botoes que abrem `FilePreviewLightbox`
- manter bloco de anexos no card
- manter fallback `Arquivo indisponivel` no item

**Step 4: Run verification**

Run: `pnpm run typecheck`

Expected: PASS (ou registrar baseline externo se houver erro nao relacionado).

**Step 5: Commit**

```bash
git add inertia/pages/responsavel/comunicados.tsx
git commit -m "feat(responsavel): open comunicado attachments in unified in-app preview"
```

### Task 4: Validacao final e deploy

**Files:**
- No file changes required

**Step 1: Run focused tests**

Run: `pnpm test --files tests/functional/responsavel/comunicados_api.spec.ts`

Expected: PASS.

**Step 2: Run typecheck**

Run: `pnpm run typecheck`

Expected: PASS or known baseline failures documented.

**Step 3: Push and monitor CI**

Run:

```bash
git push
gh run list --limit 5
```

Expected: workflows `Deploy` e `Deploy Quave` com `success`.

**Step 4: Validate in production**

Testar em:
- `https://anuaapp.com.br/responsavel/comunicados?aluno=cleiton-filho-019c05ed`

Checklist:
- abre modal unico para anexos
- imagem renderiza in-app
- PDF renderiza in-app no mesmo estilo
- navegacao entre anexos funciona
- fallback para arquivo sem URL funciona

**Step 5: Commit (se houver ajuste de polish pos-smoke test)**

```bash
git add <arquivos-ajustados>
git commit -m "fix(responsavel): polish unified attachment preview behavior"
```
