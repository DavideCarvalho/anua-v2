# Design: Indicador de alteracoes nao salvas sem asterisco no botao Salvar

## Contexto

Na tela de edicao de aluno, o botao `Salvar` estava exibindo `Salvar *` quando havia alteracoes pendentes.
Apesar de funcional, esse padrao gera ruído no CTA primario e nao comunica claramente onde a alteracao foi feita.

## Objetivo

Substituir o asterisco no botao por um padrao de sinalizacao mais claro e contextual:

1. estado global de pendencia no formulario;
2. marcacao por etapa alterada no sidebar.

## Solucao aprovada

### 1) Botao Salvar com copy estavel

- Remover `*` do label.
- `Salvar` permanece sempre com o mesmo texto (ou `Salvando...` em loading).

### 2) Indicador global no formulario

- Exibir um chip discreto no footer com texto `Alteracoes nao salvas` quando `isDirty` for `true`.
- Nao exibir o chip quando nao houver alteracoes pendentes.

### 3) Indicador por etapa alterada

- Calcular dirty por secao usando `formState.dirtyFields`.
- Associar secoes do form as etapas:
  - Etapa 1 (Aluno) -> `basicInfo`
  - Etapa 2 (Responsaveis) -> `responsibles`
  - Etapa 3 (Endereco) -> `address`
  - Etapa 4 (Informacoes Medicas) -> `medicalInfo`
- Exibir uma bolinha discreta na etapa correspondente quando houver alteracao naquela secao.

## Regras de UX

- O indicador deve ser informativo, nao bloqueante.
- Nao usar alerta visual agressivo para evitar fadiga em fluxo longo.
- Manter o comportamento de confirmacao de saida sem salvar ja implementado.

## Testes de verificacao

1. Sem alteracoes: nao mostrar chip nem bolinhas.
2. Alterar campo de `basicInfo`: mostrar chip e bolinha na etapa Aluno.
3. Alterar campo de outra etapa: bolinha na etapa correta.
4. Botao salvar continua com texto `Salvar` (sem `*`).
5. Fluxo de confirmacao ao sair sem salvar continua funcionando.

## Arquivos impactados

- `inertia/containers/edit-student/edit-student-page.tsx`
- `inertia/containers/enrollment/enrollment-sidebar.tsx`
- `tests/browser/escola/alunos/editar.spec.ts`
