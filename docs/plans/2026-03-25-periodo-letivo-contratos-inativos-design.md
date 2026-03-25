# Design: Contratos Inativos na Edicao de Periodo Letivo

## Contexto

Na tela `/escola/administrativo/periodos-letivos/:id/editar`, etapa 2 (series/cursos), algumas turmas aparecem sem contrato quando o contrato vinculado esta inativo. Isso ocorre porque a listagem de contratos usada no frontend, por padrao, traz apenas contratos ativos.

## Objetivo

Permitir visualizacao e selecao de contratos ativos e inativos nessa tela, mantendo clareza para o usuario quando a turma esta associada a contrato cancelado/inativo.

## Decisao

Usar `status='all'` na chamada de `contracts.index` nesse formulario de edicao de periodo letivo.

## Comportamento UX

- Dropdown de contrato exibe todos os contratos (ativos + inativos).
- Contratos inativos mostram sinalizacao visual (icone de alerta + badge `Inativo`).
- Quando o contrato atualmente selecionado for inativo, o trigger do seletor tambem mostra alerta.
- Tooltip no alerta: `Esta turma esta usando um contrato cancelado/inativo`.
- Fluxo nao bloqueado: usuario pode salvar mesmo com contrato inativo (somente aviso).

## Impacto tecnico

- Frontend apenas: `course-levels.tsx`.
- Backend permanece igual (ja suporta `status=all` em `ListContractsController`).
- Sem alteracao de contrato default em outras telas.

## Riscos e mitigacoes

- **Risco:** confusao visual entre ativos e inativos.
  - **Mitigacao:** badge + cor de alerta + tooltip explicativa.
- **Risco:** regressao de layout no card de nivel.
  - **Mitigacao:** manter estrutura atual e adicionar elementos compactos.

## Sucesso

- Turmas com contrato inativo deixam de parecer "sem contrato".
- Usuario entende claramente que o contrato esta cancelado/inativo.
- Nao ha quebra no salvamento do periodo letivo.
