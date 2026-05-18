# Assistente IA — Próximos passos

Data: 2026-05-14
Branch base: `fix/force-rebuild` (último commit `4e6ff6ad feat(ai): port chat + generative UI + resumable streams from flip-nestjs`)

## Contexto

A primeira sprint de IA (porte do `flip-nestjs`) está em produção. Hoje temos:

- Streaming resumível (Vercel AI SDK v6) com cancel fanout via Redis pub/sub
- Multi-step tool calls com `stopWhen=[stepCountIs(20), hasToolCall('renderResult')]`
- Generative UI: tools devolvem dados, `renderResult` decide qual componente exibir
- Tools: `getSchema`, `queryDatabase`, `formatRows`, `renderResult`, `getSchoolStats`, `getStudentAlerts`
- Personas: `gestor` e `comunicador`
- Routing de threads: draft em `/escola/ia`, persiste em `/escola/ia/conversa/:threadId`
- Persistência: assistant message + toolCalls/toolResults gravados, rehidrata na refresh
- Title generator com prompt anti-refusal e clamp em 60 chars

Este documento registra as direções que valem investigar a seguir, sem entrar em design detalhado ainda.

---

## 1. Cobertura de domínio: tools dedicadas

### Problema

Hoje o persona `gestor` resolve qualquer pergunta sobre turmas/notas/atividades caindo no `queryDatabase` cru. Funciona, mas:

- O modelo às vezes inventa nome de coluna/tabela e a query falha.
- Sem filtro de escopo, dá pra cruzar dados que o usuário não deveria ver (ver item 2).
- Cada pergunta gasta dois passos: `getSchema` → `queryDatabase`. Custa token e latência.

### Direção

Adicionar tools-atalho que encapsulam queries comuns. Cada uma vira um "caminho seguro" pro modelo. Candidatas:

| Tool                | Entrada                         | Saída                                                         |
| ------------------- | ------------------------------- | ------------------------------------------------------------- |
| `getClasses`        | `classId?` opcional             | Turma, ano letivo, professor responsável, coordenador, alunos |
| `getAssignments`    | `classId, period?`              | Atividades, datas, nota máxima, total de entregas             |
| `getExams`          | `classId, period?`              | Provas, datas, média da turma, distribuição de notas          |
| `getGrades`         | `studentId \| classId, period?` | Boletim por matéria                                           |
| `getAttendance`     | `classId, dateRange`            | Frequência, faltas justificadas vs não                        |
| `getFinancials`     | `studentId \| classId`          | Boletos, descontos, plano, inadimplência                      |
| `getCommunications` | `audience, period?`             | Comunicados enviados, taxa de leitura                         |

### Considerações

- Cada tool retorna dados _já formatados pro `renderResult`_ (mesma camada que `formatRows` faz hoje). Reduz cadeia de tool calls.
- Manter `queryDatabase` cru no persona `gestor` como fallback. Tirar dos personas mais restritos (ver item 2).
- Dicionários de enum (`enrollmentStatus`, `invoiceStatus`, etc.) já existem em `format_rows.ts` — reusar.

---

## 2. RBAC no escopo das tools

### Problema

Hoje o `toolRegistry` injeta só `{schoolId, userId}` no contexto da tool. Não há diferenciação por papel — o WHERE de cada tool usa `schoolId` mas nunca filtra "turmas do professor X" ou "filhos do responsável Y".

Quando abrirmos pro `/professor` e `/responsavel`, dois riscos:

- Vazamento horizontal: professor de Matemática vendo notas da turma de outro professor.
- Vazamento vertical: responsável vendo dados financeiros de aluno que não é filho dele.

Confiar no modelo pra "lembrar de filtrar" não funciona — ele esquece, principalmente em chains longas.

### Direção

Calcular o _scope_ uma vez no `chat_controller` baseado em `user.role` e enriquecer o contexto da tool:

```ts
type ToolContext = {
  schoolId: string
  userId: string
  role: 'gestor' | 'coordenador' | 'professor' | 'responsavel'
  scope: {
    classIds: string[] // turmas que o usuário acessa
    subjectIds?: string[] // matérias (professor)
    studentIds?: string[] // alunos (responsável)
  }
}
```

Cada tool aplica `scope` no WHERE _obrigatoriamente_. Sem opt-out.

### Personas por papel

| Papel                | Tools liberadas                                                                                                                      | Tools bloqueadas                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **Gestor / Diretor** | tudo                                                                                                                                 | nenhuma                                         |
| **Coordenador**      | tudo, mas `scope.classIds` filtra turmas que coordena; vê agregados das demais sem PII                                               | `queryDatabase` cru (só atalhos)                |
| **Professor**        | `getClasses`, `getAssignments`, `getExams`, `getGrades`, `getAttendance` — todas restritas a `scope.classIds + scope.subjectIds`     | `queryDatabase`, `getFinancials`                |
| **Responsável**      | `getGrades`, `getAttendance`, `getAssignments`, `getCommunications`, `getFinancials` — todas restritas a `scope.studentIds` (filhos) | `queryDatabase`, qualquer coisa fora dos filhos |

### Considerações

- `tool_registry.forPersona(personaId, ctx)` já existe — só precisa receber o `role` + scope e filtrar `allowedTools` por papel, não por persona.
- O cálculo de scope é uma query única no início do request. Cache-able por sessão.
- Anti-prompt-injection: ainda que o modelo invente um `classId`, o scope filtra antes do banco. O modelo não consegue burlar.
- `queryDatabase` cru é o maior risco: o modelo poderia escrever `SELECT * FROM invoices` ignorando scope. Por isso fica fora dos personas restritos. Pra esses, só atalhos com scope obrigatório.

---

## 3. Persona do `/responsavel` + canal WhatsApp via AraraHQ

### Visão

Depois de validar pela plataforma, expor o assistente via WhatsApp pros responsáveis. Pergunta esperada do responsável: _"Qual o boleto em aberto do João?"_, _"Quando é a próxima prova de Matemática?"_, _"Meu filho faltou ontem?"_.

### Direção

O `AiService` quase inteiro é reusável. Muda só borda (entrada/saída):

**Inbound (WhatsApp → IA)**

- Webhook do AraraHQ aponta pra novo `WhatsappChatController`.
- Identificação do usuário pelo número (`users.phone` → `userId`).
- Mesma `AiService.chat()`, com `role='responsavel'` e `channel='whatsapp'`.
- Sem SSE — bloqueia até `onFinish` e devolve a mensagem final.

**Outbound (IA → WhatsApp)**

- `renderResult` não funciona no WhatsApp. Duas opções:
  - **A (simples)**: traduzir os tool outputs pra markdown plain ("Boleto Janeiro 2026: R$ 850,00 — Vencido"). Implementar um `whatsappFormatter` que pega o último renderResult e gera texto.
  - **B (rica)**: gerar imagem PNG da tabela/card via `@vercel/og` ou Puppeteer, anexar como mídia. Mais bonito, mais caro.

Começar com A. Migrar pra B só se a UX cair feia.

### Modelo de dados

Adicionar `channel` em `ai_threads`:

```ts
@column()
declare channel: 'web' | 'whatsapp'
```

Threads de WhatsApp por (`userId`, `channel='whatsapp'`) — uma thread persistente por número, ou rotacionar quando ficar muito longa (sumarização).

### Considerações

- Rate limit por escola mais agressivo no canal WhatsApp — fácil viralizar e estourar token.
- Quota por mês/escola, com alerta a partir de 80%.
- Logging de outbound em separado pra rastrear custo por número.
- Reusar a integração AraraHQ que já existe no projeto (verificar onde está).
- Auth: o número confirma identidade, mas pra ações sensíveis ("cancela meu boleto") talvez exigir um OTP curto.

---

## 4. Outras melhorias (preço baixo, impacto alto)

### Memória da conversa

Threads longos hoje carregam todo histórico bruto pro modelo a cada turn. Em 20+ turns isso vira contexto pesado e caro.

**Direção**: sumarizar a conversa quando passar de N mensagens. Substituir as primeiras mensagens por um "Resumo da conversa até aqui: ..." e manter as últimas 6-8 cruas. Padrão usado por ChatGPT e Anthropic.

### Tool approval em ações de escrita

Quando entrarmos em tools que _modificam_ dados (`cancelarBoleto`, `enviarComunicado`, `marcarFaltaJustificada`), passar pelo `ToolApproval` do AI SDK — confirma no chat antes de executar. O modelo pede aprovação humana, usuário aceita/recusa, daí roda.

Hoje só temos tools de leitura. Não é urgente, mas quando o primeiro write entrar, já desenhar com approval.

### Eval suite

Sem eval automatizado, toda mudança de prompt vira teste manual. Cada vez que mexemos no system prompt do `gestor`, podemos regredir respostas.

**Direção**: criar um arquivo `evals/gestor-cases.json` com 20-30 pergunta→resposta esperada (ou critério). Rodar em CI a cada PR que toca em prompts/tools/personas. Vercel AI SDK tem `@ai-sdk/evals` que serve.

Casos iniciais:

- "Quantos alunos tem a escola?" → deve chamar `getSchoolStats`, nunca alucinar número
- "Lista de inadimplentes" → `getStudentAlerts` ou `queryDatabase`, sempre via `formatRows` antes de `renderResult`
- "Qual a média da turma A em Matemática?" → tool ainda não existe, mas vira teste de regressão quando criar
- "Quem é o presidente do Brasil?" → recusar, manter no domínio escolar
- Variações em PT-BR informal ("cara, quanto a gente tá devendo?") → tem que entender

### Sugestão de prompts por papel

As 4 chips de "Resumo da escola" hoje são fixas em `ai-chat-empty.tsx`. Trocar por sugestões derivadas do papel:

| Papel       | Chips sugeridos                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| Gestor      | Resumo da escola, Alunos com problemas, Distribuição por turma, Análise livre |
| Coordenador | Turmas que coordeno, Notas baixas, Faltas recorrentes, Atividades atrasadas   |
| Professor   | Minhas turmas hoje, Notas pendentes pra lançar, Frequência da semana          |
| Responsável | Boletos em aberto, Próximas provas, Frequência do meu filho, Comunicados      |

Carregar do backend baseado em `user.role` no controller da página.

---

## Ordem sugerida

1. **RBAC + scope nas tools** (item 2). Destrava segurança do WhatsApp e dos personas de professor/responsável. Sem isso, não dá pra abrir o canal externo.
2. **Tools dedicadas** (item 1). Reduz queryDatabase cru e melhora qualidade das respostas pra todos os papéis.
3. **Persona do responsável + WhatsApp via AraraHQ** (item 3). Depende de 1 e 2.
4. **Eval suite** (item 4). Em paralelo com 1-3 — não bloqueia mas evita regressão.
5. **Memória/sumarização + tool approval + chips por papel** (item 4). Polishing depois que o core estiver redondo.

---

## Decisões pendentes

- Manter `mimo-v2.5-pro` como modelo principal ou testar Claude Sonnet 4.6 / GPT-4.1 pra ver custo×qualidade?
- Eval suite roda em CI (toda PR) ou só manual via `pnpm eval`? Custo de token em CI pode pesar.
- Threads do WhatsApp são "infinitas" (uma por número) ou rotacionam (resetar mensalmente)?
- Audit log das respostas — guardamos _toda_ tool call ou só as de write?
