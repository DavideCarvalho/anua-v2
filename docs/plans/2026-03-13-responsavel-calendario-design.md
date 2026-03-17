# Design: Calendario do responsavel (lista, semana e mes)

## Contexto

- O modulo `/responsavel` ja possui seletor de aluno no layout e varias paginas pedagogicas por aluno.
- Nao existe hoje uma pagina dedicada de calendario em `/responsavel`.
- O calendario de `/escola` ja oferece visoes e componentes maduros, porem com capacidades de edicao/criacao que nao devem existir para responsavel.

## Objetivo

1. Criar pagina `GET /responsavel/calendario` no mesmo padrao visual do modulo responsavel.
2. Exibir compromissos do aluno selecionado em tres visoes: `lista`, `semana` e `mes`.
3. Unificar no feed: atividades, provas e eventos escolares.
4. Garantir experiencia somente leitura (sem criar, editar, arrastar ou redimensionar itens).

## Decisoes aprovadas

- Pagina nova dedicada: `/responsavel/calendario`.
- Escopo sempre do aluno selecionado no layout (nao consolidar todos os filhos).
- Visoes suportadas: `lista`, `semana`, `mes`.
- Lista usa janela rolling de 30 dias.
- Fonte de dados via endpoint unico agregado no backend.

## Abordagens consideradas

### A. Endpoint unico agregado (aprovada)

- Criar endpoint unico para retornar itens normalizados de atividade, prova e evento.
- Frontend consome um contrato padrao e apenas renderiza por visao.

**Por que foi escolhida:** reduz acoplamento no frontend, centraliza regra de seguranca/filtro e facilita evolucao de performance.

### B. Agregacao no frontend (nao escolhida)

- Chamar varios endpoints e mesclar no cliente.
- Maior complexidade de estado e maior custo de manutencao.

### C. Feed materializado (nao escolhida)

- Bom para escala alta, mas overkill para a fase atual.

## Arquitetura proposta

### 1) Rotas de pagina

- Adicionar rota de pagina: `/responsavel/calendario` em `start/routes/pages/responsavel.ts`.
- Criar controller de pagina para render Inertia de `responsavel/calendario`.
- Incluir item "Calendario" no menu pedagogico em `inertia/components/layouts/responsavel-layout.tsx`.

### 2) Endpoint agregado

- Nova rota API: `GET /api/v1/responsavel/students/:studentId/calendar`.
- Controller dedicado em `app/controllers/responsavel/get_student_calendar_controller.ts`.
- Validacao obrigatoria de vinculo `responsavel <-> aluno` antes de consultar dados.

## Contrato de dados

### Request

- Path param:
  - `studentId` (obrigatorio)
- Query params:
  - `view`: `list | week | month` (default `list`)
  - `from`: ISO datetime opcional
  - `to`: ISO datetime opcional

### Regras de intervalo

- `list`: sem `from/to`, usar `hoje` ate `hoje + 30 dias`.
- `week` e `month`: frontend envia intervalo da navegacao.

### Response

```json
{
  "items": [
    {
      "id": "exam:019...",
      "sourceType": "exam",
      "sourceId": "019...",
      "title": "Prova de Matematica",
      "description": "Capitulos 1 a 3",
      "startAt": "2026-03-20T03:00:00.000Z",
      "endAt": null,
      "allDay": true,
      "className": "5o Ano A",
      "subjectName": "Matematica",
      "status": "SCHEDULED",
      "colorToken": "exam"
    }
  ],
  "meta": {
    "studentId": "019...",
    "view": "month",
    "from": "2026-03-01T00:00:00.000Z",
    "to": "2026-03-31T23:59:59.999Z",
    "timezone": "America/Sao_Paulo"
  }
}
```

## Mapeamento das fontes

- **Atividades**: usar data de entrega (`dueDate`) como `startAt`.
- **Provas**: usar data agendada (`examDate`/`scheduledDate`) como `startAt`.
- **Eventos**: usar `startDate` e `endDate` quando disponiveis, respeitando audiencia/visibilidade aplicavel ao aluno.

## Seguranca e autorizacao

- Se `studentId` nao pertence ao responsavel autenticado: retornar `403`.
- Nunca retornar itens de outros alunos no endpoint.
- Aplicar sempre filtro por escola do contexto ativo.

## Experiencia de uso (UI)

- Cabecalho da pagina com titulo "Calendario" e subtitulo contextual.
- Seguir aluno selecionado no layout via `useSelectedStudent()`.
- Estados obrigatorios:
  - loading (skeleton)
  - sem aluno selecionado
  - sem itens no periodo
  - erro de carregamento
- Interface somente leitura:
  - sem botao novo/editar
  - sem drag and drop
  - sem resize de eventos

## Performance

- Buscar dados apenas para intervalo visivel por view.
- Ordenar por `startAt ASC` no backend.
- Evitar payload excessivo (somente campos necessarios para render).

## Observabilidade

- Registrar erros de consulta agregada com contexto minimo (`studentId`, `view`, intervalo).
- Em falha de uma fonte parcial, falhar request com erro claro (evitar feed inconsistente silencioso).

## Testes

### Functional (API)

1. Retorna itens agregados para aluno autorizado.
2. Retorna `403` para aluno nao vinculado ao responsavel.
3. Respeita filtros de intervalo (`from/to`) e `view`.
4. Nao vaza itens de outro aluno.

### Browser (responsavel)

1. Acessa `/responsavel/calendario` e renderiza as 3 visoes.
2. Lista mostra proximos 30 dias por padrao.
3. Troca de aluno no seletor atualiza os itens.
4. Nao exibe acao de criar/editar no calendario.

## Criterios de aceite

1. Existe pagina funcional em `/responsavel/calendario`.
2. A pagina exibe `lista`, `semana` e `mes` para o aluno selecionado.
3. Feed contem atividades, provas e eventos em contrato unico.
4. Endpoint bloqueia acesso a alunos nao vinculados.
5. Interface permanece estritamente somente leitura.
