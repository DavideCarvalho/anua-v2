## Contexto

A aplicacao ainda nao possui cobertura de testes para o fluxo de alunos da escola.
Vamos iniciar pelo caminho `/escola/administrativo/alunos`, que hoje renderiza a pagina Inertia de alunos e consome dados do endpoint `GET /api/v1/students`.

Decisoes validadas:

- Fase 1 cobre API + acesso da pagina (sem e2e/UI behavior).
- Prioridade em regras de autorizacao, escopo por escola e contrato de resposta.
- Incremento rapido com testes funcionais Japa aproveitando stack ja existente.

## Objetivo

Criar uma base de testes confiavel para o modulo de alunos, garantindo que:

- o endpoint de listagem respeita autenticacao, escopo e filtros principais;
- o acesso a pagina administrativa de alunos obedece os middlewares de seguranca;
- a suite seja simples de evoluir para novas coberturas nas proximas fases.

## Abordagens consideradas

1. Testes funcionais de backend para API + pagina (escolhida)
   - Pro: alto valor inicial, baixo custo de manutencao, sem introduzir nova stack.
   - Contra: nao valida interacoes de UI no navegador.

2. Smoke tests minimos (status/shapes basicos)
   - Pro: entrega muito rapida.
   - Contra: cobertura insuficiente para regras criticas.

3. Cobertura extensa ja na fase 1 (muitos cenarios de borda)
   - Pro: cobertura alta desde o inicio.
   - Contra: aumenta custo inicial sem base de fixtures/helpers consolidada.

## Design tecnico

### Escopo fase 1

- API: `GET /api/v1/students`
- Pagina: `GET /escola/administrativo/alunos`

Sem incluir nesta etapa:

- testes de comportamento React (filtros no client, menu de acoes, modais);
- testes browser/e2e.

### Casos da API (`GET /api/v1/students`)

1. Nao autenticado retorna `401`.
2. Autenticado retorna `200` com `data` e `metadata`.
3. Escopo por escola: retorna somente alunos de `selectedSchoolIds`.
4. Sem escola selecionada para usuario nao admin: retorno vazio (fail-safe).
5. Filtro `search` aplicado em `name`/`email`/`documentNumber`.
6. Filtro por `classId`.
7. Filtro por `academicPeriodId` e por `courseId`.
8. Paginacao (`page`, `limit`) com `metadata` consistente.
9. Validacao: `limit > 100` retorna erro de validacao.

### Casos da pagina (`GET /escola/administrativo/alunos`)

1. Nao autenticado redireciona para `/login`.
2. Autenticado com escola acessa com `200`.
3. Autenticado sem escola redireciona para `/dashboard`.
4. Usuario `SCHOOL_TEACHER` e redirecionado para `/escola/pedagogico/turmas`.

## Estrategia de implementacao

- Arquivo inicial: `tests/functional/escola/alunos_page_and_students_api.spec.ts`.
- Ordem sugerida:
  1. auth API + auth pagina;
  2. acesso com/sem escola;
  3. listagem paginada basica;
  4. escopo por escola;
  5. filtros principais;
  6. validacao de limite.
- Isolamento: transacao global por teste (`beginGlobalTransaction` + rollback).
- Fixtures: helpers locais no proprio spec (fase 1), sem introduzir factories globais ainda.

## Criterios de pronto da fase 1

- Todos os cenarios definidos acima implementados e verdes.
- Execucao direcionada da suite funcional do arquivo novo sem flakes.
- Cobertura suficiente para proteger regressao em autorizacao e contratos do endpoint.

## Riscos e mitigacoes

- Risco: setup de dados para filtros (`academicPeriodId`/`courseId`) exigir relacoes extensas.
  - Mitigacao: montar dados minimos e focar na regra observavel por endpoint.

- Risco: acoplamento com middlewares de sessao/impersonation ao testar pagina.
  - Mitigacao: criar cenarios explicitos de autenticacao e contexto de escola por teste.

## Fora de escopo

- Testes e2e/browser para interacoes visuais da pagina de alunos.
- Cobertura dos modais de acao (editar pagamento, gerenciar matricula, excluir aluno).
- Cobertura de outros endpoints de alunos (create/update/destroy/enroll) nesta primeira entrega.
