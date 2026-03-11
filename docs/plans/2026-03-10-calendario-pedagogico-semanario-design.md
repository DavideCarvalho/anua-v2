## Contexto

- O calendario atual em `/escola/eventos` mostra apenas eventos.
- A escola precisa de um calendario pedagogico unificado com: eventos, atividades, provas, feriados e fins de semana letivos.
- O semanario sera uma camada de orquestracao por turma + semana para planejar o curriculo.
- O semanario nao tera tabela propria no banco no MVP.

## Decisoes validadas

- Novo ponto principal: `Pedagogico > Calendario` (substitui `Eventos` no menu pedagogico).
- Abordagem escolhida: orquestrador sem tabela propria.
- Escopo de criacao do semanario: manual com apoio do calendario.
- Ao salvar item no semanario, cria registro oficial imediatamente nos modulos existentes.
- Semanario precisa de 3 visoes: lista, semana e mes.
- Ao abrir a semana, deve pre-popular com atividades/provas/eventos ja existentes.
- Feriados e fins de semana letivos vem do calendario do periodo letivo existente.
- Escopo funcional por contexto: turma + semana (sem `if` por segmento).

## Design

### Arquitetura

- Criar nova pagina de calendario pedagogico em `Pedagogico`.
- Manter `/escola/eventos` como legado durante transicao.
- Calendario pedagogico agrega dados de 4 fontes:
  - `events`
  - `assignments`
  - `exams`
  - calendario do periodo letivo (feriados e fins de semana letivos)
- Criar endpoint agregador para retornar itens unificados por `classId` e intervalo de datas.

### Modelo de item unificado (somente resposta de API)

- `sourceType`: `EVENT | ASSIGNMENT | EXAM | HOLIDAY | WEEKEND_CLASS_DAY`
- `sourceId`: id do registro de origem (quando houver)
- `title`, `description`
- `startAt`, `endAt`, `isAllDay`
- `schoolId`, `academicPeriodId`, `classId`
- `readonly` (true para `HOLIDAY` e `WEEKEND_CLASS_DAY`)
- `meta` (campos especificos por fonte, ex.: status de prova)

### UX da pagina

- Header com:
  - seletor de turma
  - navegacao de periodo
  - alternancia de visao: Lista | Semana | Mes
  - botao `Novo item` com opcoes `Atividade`, `Prova`, `Evento`
- Visao Lista:
  - agrupada por dia
  - mostra tipo, titulo, horario/data e acoes
- Visao Semana:
  - grade semanal com itens posicionados por data/hora
- Visao Mes:
  - calendario mensal com resumo por dia
- Itens de feriado/fim de semana letivo:
  - aparecem com estilo proprio
  - sempre leitura (sem edicao nessa tela)

### Orquestracao de criacao/edicao

- Criacao via semanario usa APIs oficiais ja existentes:
  - Atividade -> `api.v1.assignments.store`
  - Prova -> `api.v1.exams.store`
  - Evento -> `api.v1.events.store`
- Edicao/remocao continua nos fluxos oficiais por fonte:
  - abrir tela/modal da entidade original
  - chamar endpoint oficial correspondente

### Permissoes

- Reaproveitar as regras de permissao de cada modulo de origem.
- Acoes indisponiveis devem ficar ocultas/desabilitadas conforme permissao.

### Erros e estados

- Falha em criacao de item nao perde estado atual da semana.
- Mensagem de erro contextual por tipo de item.
- Sem turma selecionada: estado vazio com CTA para selecionar turma.
- Dados ausentes de vinculacao (turma/periodo/curso): mostrar erro orientativo e bloquear criacao invalida.

### Testes

- Backend:
  - agregador retorna merge correto das fontes
  - filtros por `classId` e intervalo
  - ordenacao cronologica
  - marcacao `readonly` para feriados/fins de semana letivos
- Frontend:
  - render das 3 visoes
  - troca de visao e navegacao de periodo
  - pre-populacao da semana
  - criacao por tipo invocando endpoint certo
- Integracao:
  - item criado no semanario aparece nas paginas oficiais da turma (atividades/provas/eventos)

### Rollout

- Fase 1: leitura agregada + visoes (lista/semana/mes)
- Fase 2: criacao de itens via semanario
- Fase 3: ajustes de UX e despriorizacao de `/escola/eventos` no fluxo principal
- Sem migracao de banco no MVP
