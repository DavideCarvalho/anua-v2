# App Mobile — Responsável (Anuá)

**Status:** DRAFT — brainstorming em andamento. Algumas sections do design ainda não foram apresentadas/aprovadas (ver "Pontos pendentes" no fim).

**Data:** 2026-05-21

**Contexto da retomada:** estamos no fluxo da skill `superpowers:brainstorming`. Decisões 1–8 travadas; Section 1 do design (arquitetura geral) já apresentada e aguardando aprovação. Próximos passos detalhados no fim do doc.

---

## Resumo executivo

App nativo (iOS + Android) pra **responsáveis** do Anuá. Cobre o subset operacional do dia a dia escolar do filho/aluno, sem replicar paridade total com a área web `/responsavel/*` no v1. Construído em **Expo + React Native**, monorepo dentro do `anua-v2`, consumindo o backend Adonis via **client Tuyau** já existente.

**Por que existe (motivação travada):**

- **Presença comercial nas stores** (App Store / Play Store) — necessária pra credibilidade no pitch de vendas pra escolas.
- **UX mobile-first de verdade** — o `/responsavel` web responsive não está confortável pra uso diário no celular.

---

## Decisões travadas

### 1. Motivação principal

- **B (stores)** + **C (UX nativa real)**
- Push e capacidades nativas ficam como reforço, não como driver principal.

### 2. Escopo MVP (jobs-to-be-done)

Cobrir do **#1 ao #8**:

1. Comunicados / recados da escola
2. Frequência + ocorrências do aluno
3. Mensalidade / boletos
4. Cantina (saldo, pedidos, restrições)
5. Chat com escola / professores
6. Calendário + horário
7. Notas / boletim
8. Autorizações (passeio, saída antecipada, etc.)

**Fora do MVP (v2):**

- 9. Gamificação / atividades do filho
- 10. Documentos / matrícula / contratos

### 3. Stack de cliente

- **Expo (React Native)** com Tuyau client direto do monorepo.
- Não Capacitor (cara de webview atrita com C).
- Não Flutter (rampa de Dart vs time React, sem ganho que justifique).

### 4. Plataformas

- **iOS + Android no v1**, ambos lançados juntos.
- EAS Build cuida do binário iOS sem precisar Mac local.

### 5. Organização do código

- **Monorepo dentro do `anua-v2`** (workspace pnpm).
- `apps/mobile/` ao lado de `apps/web/` (rearranjo leve, sem mover backend).
- `packages/shared/` pra formatadores, validators e tipos do domínio reaproveitáveis em puro TypeScript.
- Tuyau client consumido via path alias do monorepo (zero pacote publicado).

### 6. Estratégia de auth

- Adicionar **`accessTokensGuard` do AdonisJS** (`@adonisjs/auth/access_tokens`) sem mexer no `sessionGuard` atual do web.
- Reusa fluxo passwordless OTP existente (`/auth/send-code` + `/auth/verify-code`).
- `verify-code` passa a devolver `{token, user}` quando a origem indica mobile.
- Token armazenado em **`expo-secure-store`** (Keychain no iOS, Keystore no Android).
- Middleware `auth()` aceita dual guard: `auth.authenticateUsing(['web', 'api'])`.
- **Pendente confirmar:** canal real do OTP atual (WhatsApp? email? ambos?). Verificar nos controllers `send_code.ts` e `verify_code.ts`.

### 7. Push notifications

- **Expo Push Service** (gratuito, em cima de FCM/APNs).
- Backend ganha:
  - Tabela `device_tokens` (`user_id`, `token`, `platform`, `last_seen_at`).
  - Endpoint `POST /api/v1/devices` pra registro/refresh.
  - Job que dispara push em eventos relevantes (comunicado novo, ocorrência criada, boleto vencendo, mensagem no chat, autorização aguardando resposta).
- Caminho de fuga: se um dia migrar pra FCM/APNs direto, a tabela e os tokens servem — só troca o transporte HTTP.

### 8. Stack default aprovada

| #   | Decisão                      | Escolha                                                                                                                                                                                     |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Styling                      | **Nativewind v4** (Tailwind no RN) — `tailwind.config` mobile espelha tokens do `DESIGN.md` (cores OKLCH, spacing, rounded)                                                                 |
| 2   | Navigation                   | **Expo Router v4** (file-based)                                                                                                                                                             |
| 3   | Data fetching                | **`@tuyau/react-query`** (mesmo do web) + `@tanstack/react-query` v5; **inline** `api.api.v1.X.queryOptions(...)`, preferir `await` em vez de `void` (segue [[feedback_anua_query_inline]]) |
| 4   | Storage de token             | **`expo-secure-store`**                                                                                                                                                                     |
| 5   | Cache persistente            | **`@tanstack/react-query-persist-client`** + `AsyncStorage` (warm start)                                                                                                                    |
| 6   | i18n                         | Hardcoded **pt-BR** no v1 (sem framework de i18n); `date-fns/locale/pt-BR`, `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`                                            |
| 7   | Analytics                    | **PostHog RN SDK** (mesma org "Anuá" id 264695, mesmo projeto id 264695)                                                                                                                    |
| 8   | Crash reporting              | **Sentry RN** via `@sentry/react-native` + Sentry Expo plugin                                                                                                                               |
| 9   | OTA updates                  | **EAS Update**                                                                                                                                                                              |
| 10  | Tema                         | **Light + Dark**, ambos seguindo `DESIGN.md`                                                                                                                                                |
| 11  | Login UX                     | **Email/identificador + OTP de 6 dígitos** via `verify-code` (canal pendente confirmação)                                                                                                   |
| 12  | Primitivas nativas seletivas | **`@expo/ui`** pra inputs onde "cara nativa" importa (date picker, switch, picker, slider) — Nativewind cuida do resto                                                                      |

### Reaproveitamento de código web (discutido)

- **Não** vamos usar Expo DOM Components como caminho principal — voltaria parcialmente ao território de webview que **C** quis evitar, com riscos de App Store flag e gestos quebrados.
- DOM Components ficam disponíveis pra uso **cirúrgico** em ilhas específicas (rich-text de comunicado, viewer de PDF de contrato).
- O reaproveitamento real será:
  - **Lógica de negócio pura** (formatadores, validators, tipos do Tuyau) → `packages/shared/`.
  - **Tokens visuais** do `DESIGN.md` → `tailwind.config` mobile.
  - **Estrutura visual das telas web** → referência durante a reescrita em primitivas RN, mas não import direto.

---

## Section 1 do design (apresentada, ainda não aprovada formalmente)

### Arquitetura geral

```
anua-v2/  (monorepo, pnpm workspace)
├── apps/
│   ├── web/                ← Adonis + Inertia (código atual, sem mover)
│   └── mobile/             ← NOVO — Expo SDK + React Native
│       ├── app/            ← Expo Router (file-based)
│       ├── components/     ← UI components mobile (Nativewind)
│       ├── lib/            ← api client, auth, push, storage
│       └── app.json
├── packages/
│   └── shared/             ← NOVO — formatters, validators, tipos do domínio
└── ...  (start, app, database, etc. — backend, igual hoje)
```

- **Backend** já cobre o MVP via `start/routes/api/responsavel.ts` (grades, attendance, payments, invoices, balance, cantina, assignments, schedule, occurrences). Ganha apenas:
  1. `accessTokensGuard`
  2. Tabela `device_tokens` + endpoint de registro
  3. Job que dispara Expo Push em eventos relevantes
- **App**: Expo + RN + Nativewind + Expo Router + Tuyau client (path alias do monorepo) + react-query (com persist) + expo-secure-store + expo-notifications + Sentry + PostHog.
- **Deploy**: EAS Build (binário), EAS Update (OTA), EAS Submit (App Store + Play).
- **Distribuição inicial**: TestFlight (iOS) + Play Internal Track (Android) pro piloto, depois review formal.

---

## Pontos pendentes pra continuar amanhã

### Sections do design ainda não apresentadas

1. **Aprovação formal da Section 1** (arquitetura) — apresentei, ficou parado aqui.
2. **Section 2 — Componentes e telas do MVP**
   - Estrutura de navegação (tabs? stack? combinação?)
   - Inventário de telas por job (1-8) com nível de detalhe de "o que tem dentro"
   - Componentes compartilhados (lista virtualizada de items, card de aluno, header com seletor de filho, empty state, error state)
   - Tratamento de múltiplos filhos por responsável (seletor global vs por tela)
3. **Section 3 — Fluxo de dados e auth**
   - Diagrama do login (OTP → token → secure-store → bootstrap)
   - Estratégia de refresh do token (expiração? rotação?)
   - Como o react-query persist se comporta em erro 401 (limpar cache, redireciona pra login)
   - Reuso de queryOptions inline com guardrails de invalidação
4. **Section 4 — Push notifications**
   - Inventário de eventos que disparam push (e o copy de cada)
   - Deep link de cada notificação (abrir push de boleto → tela do boleto)
   - Tela de preferências de notificação (granular por categoria?)
   - Behavior em foreground vs background
5. **Section 5 — Tratamento de erros, offline e edge cases**
   - Estratégia offline (read-only com cache vs degradação graciosa)
   - Tela de erro / sem conexão
   - Modo "respondente impersonado" (precisa? mesma flag do web?)
6. **Section 6 — Testes**
   - Testes E2E (Maestro? Detox?) — pelo menos golden path de login + ver comunicado + ver boleto
   - Unit tests pra lógica em `packages/shared/`
7. **Section 7 — Plano de slicing MVP**
   - Ordem de implementação (qual job primeiro pra dogfood interno?)
   - Hipótese de cronograma realista até TestFlight/Play Internal
8. **Section 8 — Métricas de sucesso do MVP**
   - O que medir no PostHog pra saber se o app tá "funcionando"
   - Funnels web↔mobile

### Decisões abertas que precisam de input

- **Canal de OTP atual** — verificar `app/controllers/auth/send_code.ts` e `verify_code.ts` pra confirmar WhatsApp/email/SMS antes de cravar o login flow.
- **Tratamento de múltiplos filhos** — responsável com 2+ filhos vê tudo agregado, alterna global, ou tela por tela tem seletor?
- **Modo "criança/adolescente"** — algum responsável tem visão limitada por idade do aluno? (DESIGN.md menciona `.gamified` token só pro app aluno — não deve impactar aqui, mas vale confirmar)
- **Compliance** — privacidade de dados de menor, LGPD, qualquer requisito específico de escola privada? Pode mudar copy de termos de uso e telas de privacidade.

### Verificações técnicas pendentes

- Confirmar versão do Expo SDK atual de mercado e compatibilidade do `@expo/ui` em produção real.
- Confirmar que o Tuyau client gerado em `.adonisjs/client/` pode ser importado de `apps/mobile/` sem ajuste de `tsconfig`.
- Confirmar disponibilidade do PostHog RN SDK na conta organizacional.

---

## Próximo passo concreto ao retomar

1. **Retomar com aprovação ou ajuste da Section 1** acima.
2. Seguir pela ordem de sections 2 → 8.
3. Em paralelo, posso checar o canal do OTP atual e o conteúdo de `send_code.ts` / `verify_code.ts` pra fechar a decisão de login UX.
4. Ao fechar todas as sections, gerar a versão final deste doc (remover blocos "DRAFT" e "Pontos pendentes") e commitar.
5. Invocar a skill `writing-plans` pra montar o plano de implementação.

---

## Comandos úteis pra retomar

```bash
# Continuar de onde parou
cat docs/superpowers/specs/2026-05-21-app-mobile-responsavel-design.md

# Verificar o canal do OTP atual
cat app/controllers/auth/send_code.ts
cat app/controllers/auth/verify_code.ts

# Olhar o que a API responsavel já cobre
cat start/routes/api/responsavel.ts
```
