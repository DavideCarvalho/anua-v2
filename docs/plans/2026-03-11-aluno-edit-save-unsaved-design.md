# Design: Botao Salvar e protecao de alteracoes nao salvas na edicao de aluno

## Contexto

Na tela de edicao de aluno (`/escola/administrativo/alunos/:id/editar`), hoje o footer mostra `Cancelar` e `Proximo` na maior parte dos passos, e so permite salvar no ultimo passo (`Revisao`).

Requisito aprovado:

1. Adicionar botao `Salvar` na tela (junto de cancelar e proximo).
2. Mostrar um indicador visual no `Salvar` quando houver alteracoes pendentes.
3. Se o usuario tentar sair sem salvar, pedir confirmacao em todas as formas de saida:
   - botoes locais (`Cancelar` e link de voltar)
   - navegacao interna do app
   - refresh/fechar aba

## Abordagem escolhida

Adotar a opcao A (recomendada): usar o estado global `form.formState.isDirty` do `react-hook-form` como fonte unica para detectar alteracoes nao salvas.

### Por que essa abordagem

- Menor complexidade e menor risco de inconsistencias.
- Cobre todos os campos ja registrados no formulario sem logica custom por secao.
- Integra naturalmente com o submit ja existente (`form.handleSubmit(handleSubmit)`).

## Design tecnico

### 1) Footer com salvar sempre disponivel

- Manter `Anterior`, `Cancelar` e `Proximo`.
- Exibir `Salvar` em todos os passos, nao apenas na revisao.
- `Salvar` chama o mesmo fluxo de submit atual.
- `Proximo` continua validando apenas o passo atual.

### 2) Indicador visual de pendencia no Salvar

- Derivar `hasUnsavedChanges` de `form.formState.isDirty`.
- Quando `true`, exibir um pequeno marcador visual no label do botao `Salvar` (por exemplo, um ponto `*` ao lado do texto).
- Quando `false`, o botao aparece sem marcador.

### 3) Protecao contra saida sem salvar

Implementar guard unico reutilizavel na pagina:

- `confirmDiscardChanges()`:
  - se `hasUnsavedChanges` for `false`, retorna `true`.
  - se `true`, exibe `window.confirm('Voce tem alteracoes nao salvas. Deseja sair sem salvar?')`.

Aplicacoes do guard:

1. **Cancelar e Voltar para alunos**
   - envolver a navegacao com `confirmDiscardChanges()`.

2. **Navegacao interna Inertia**
   - registrar listener no ciclo de vida do Inertia para evento `before`.
   - quando houver alteracoes, cancelar a navegacao se usuario negar confirmacao.
   - garantir cleanup do listener no `useEffect`.

3. **Refresh/fechar aba**
   - registrar `beforeunload` quando `hasUnsavedChanges` estiver ativo.
   - remover listener no cleanup.

### 4) Comportamento apos salvar

- Manter comportamento atual: toast de sucesso e redirecionamento para lista de alunos.
- Como ha redirecionamento imediato no sucesso, nao e necessario reset manual adicional do dirty state.

## Tratamento de erros

- Reutilizar tratamento atual de erros do submit (422/500/generico).
- A protecao de saida nao interfere no submit, apenas em tentativas de navegacao sem salvar.

## Testes e verificacao

1. Alterar qualquer campo e verificar marcador no `Salvar`.
2. Clicar `Cancelar` com alteracao pendente e validar dialogo de confirmacao.
3. Tentar navegar para outra rota (menu/sidebar) com alteracao pendente e validar bloqueio.
4. Tentar refresh/fechar aba com alteracao pendente e validar aviso nativo do browser.
5. Salvar com sucesso e validar redirecionamento sem aviso adicional.
6. Navegar sem alteracoes pendentes e validar ausencia de confirmacoes.

## Arquivos impactados

- `inertia/containers/edit-student/edit-student-page.tsx`
