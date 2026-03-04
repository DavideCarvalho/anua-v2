## Contexto

Precisamos impedir entrada de usuarios com 14 anos ou menos no fluxo de login por codigo OTP, especificamente no endpoint `POST /api/v1/auth/send-code`.

Requisitos validados:

- Bloquear quando o usuario tiver `birthDate` valida e idade `<= 14`.
- Se `birthDate` estiver ausente, permitir o fluxo normalmente.
- Manter resposta generica para nao revelar motivo do bloqueio.
- Implementar no endpoint de envio de codigo (nao no `verify_code` nesta etapa).

## Objetivo

Evitar que usuarios com 14 anos ou menos recebam codigo de acesso, preservando anti-enumeracao de contas e mantendo o comportamento publico consistente.

## Abordagens consideradas

1. Bloquear no `send_code` (escolhida)
   - Pro: simples, eficiente, evita envio de e-mail indevido e reduz custo.
   - Contra: usuario bloqueado recebe resposta generica de sucesso.

2. Bloquear no `verify_code`
   - Pro: menor mudanca no envio.
   - Contra: ainda envia OTP para quem nao deveria entrar.

3. Bloquear em ambos (`send_code` e `verify_code`)
   - Pro: defesa em profundidade.
   - Contra: maior complexidade sem necessidade imediata.

## Design tecnico

### Ponto de integracao

Arquivo alvo: `app/controllers/auth/send_code.ts`.

A verificacao entra apos identificar usuario ativo e antes de lock/cooldown/geracao de OTP.

### Regra de idade

- Ler `user.birthDate`.
- Se `birthDate` nao existir, seguir fluxo atual.
- Se existir, calcular idade com Luxon:
  - `Math.floor(DateTime.now().diff(birthDate, 'years').years)`
- Se idade `<= 14`, interromper e retornar resposta generica de sucesso, sem criar OTP e sem enviar e-mail.

### Resposta e seguranca

- Manter `200 OK` com a mesma mensagem generica existente.
- Nao expor se o bloqueio foi por idade, inexistencia de conta ou inatividade.
- Preserva protecao contra enumeracao por e-mail.

## Fluxo resultante

1. Validar payload (`email`).
2. Normalizar e-mail.
3. Buscar usuario por e-mail.
4. Se usuario inexistente/inativo, retornar mensagem generica.
5. Se usuario ativo com `birthDate` valida e idade `<= 14`, retornar mensagem generica.
6. Caso contrario, seguir fluxo atual: lock, cooldown, criar OTP, enviar e-mail, responder com mensagem generica.

## Testes

Criar testes de API do Adonis em `tests/functional/auth/send_code.spec.ts` com Japa.

Cenarios minimos:

1. Usuario ativo com idade `<= 14`
   - Esperado: `200` com mensagem generica.
   - Esperado: nenhum envio de e-mail.

2. Usuario ativo com idade `> 14`
   - Esperado: `200` com mensagem generica.
   - Esperado: envio de e-mail ocorre.

3. Usuario ativo sem `birthDate`
   - Esperado: `200` com mensagem generica.
   - Esperado: envio de e-mail ocorre.

4. Usuario inexistente/inativo
   - Esperado: comportamento atual preservado (mensagem generica).

## Riscos e mitigacoes

- Risco: diferenca temporal no calculo de idade em virada de data.
  - Mitigacao: usar mesma estrategia de calculo ja adotada no projeto (Luxon + `diff(..., 'years')`).

- Risco: regressao no fluxo OTP existente.
  - Mitigacao: cobertura de testes de API focada em envio/bloqueio.

## Fora de escopo

- Alterar `verify_code` para repetir a regra de idade.
- Alterar UX da pagina de sign-in para mensagem explicita de bloqueio.
- Exigir `birthDate` para liberar envio.
