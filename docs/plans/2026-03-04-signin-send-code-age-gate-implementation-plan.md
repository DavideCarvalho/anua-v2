# Sign-in Send Code Age Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Impedir envio de OTP no `POST /api/v1/auth/send-code` para usuarios ativos com idade `<= 14`, mantendo resposta generica e permitindo usuarios sem `birthDate`.

**Architecture:** A regra entra no controller `SendCodeController` antes do lock/cooldown/geracao de OTP. O calculo de idade usa Luxon (mesma abordagem ja usada no projeto) e a saida publica permanece invariavel (`200` + mensagem generica) para preservar anti-enumeracao. A seguranca da mudanca vem de testes funcionais de API cobrindo bloqueio e caminhos permitidos.

**Tech Stack:** AdonisJS v7, TypeScript, Lucid ORM, Luxon, Japa, plugin-adonisjs, Mail fake.

---

### Task 1: Criar base de testes funcionais de auth

**Files:**

- Create: `tests/functional/auth/send_code.spec.ts`

**Step 1: Write the failing test**

Escrever o primeiro teste de smoke do endpoint para documentar o contrato de resposta generica.

```ts
import { test } from '@japa/runner'

test.group('Auth send-code', () => {
  test('returns generic success message', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/send-code').json({
      email: 'nobody@example.com',
    })

    response.assertStatus(200)
    assert.equal(
      response.body().message,
      'Se o e-mail estiver cadastrado, enviaremos um codigo de acesso.'
    )
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/auth/send_code.spec.ts`
Expected: FAIL por arquivo/suite inexistente inicialmente ou setup incompleto.

**Step 3: Write minimal implementation**

Criar o arquivo de teste com o grupo e o caso de smoke acima.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/auth/send_code.spec.ts`
Expected: PASS no caso de resposta generica.

**Step 5: Commit**

```bash
git add tests/functional/auth/send_code.spec.ts
git commit -m "test: add auth send-code api test scaffold"
```

### Task 2: Cobrir bloqueio para idade <= 14 (TDD)

**Files:**

- Modify: `tests/functional/auth/send_code.spec.ts`
- Modify: `app/controllers/auth/send_code.ts`

**Step 1: Write the failing test**

Adicionar teste para usuario ativo com `birthDate` de 14 anos (ou menos), esperando resposta generica e nenhum envio de e-mail.

```ts
test('blocks otp for users age 14 or less with generic response', async ({ client, assert }) => {
  // arrange user ativo com birthDate <= 14
  // mail fake

  const response = await client.post('/api/v1/auth/send-code').json({
    email: 'young.user@example.com',
  })

  response.assertStatus(200)
  assert.equal(
    response.body().message,
    'Se o e-mail estiver cadastrado, enviaremos um codigo de acesso.'
  )

  // assert mail nao enviado (mail fake assertions)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/auth/send_code.spec.ts --tests "blocks otp for users age 14 or less with generic response"`
Expected: FAIL porque hoje o controller envia OTP para esse usuario.

**Step 3: Write minimal implementation**

No `app/controllers/auth/send_code.ts`:

```ts
import { DateTime } from 'luxon'

const AGE_GATE_MAX = 14

function getAgeInYears(birthDate: DateTime): number {
  return Math.floor(DateTime.now().diff(birthDate, 'years').years)
}

// dentro de handle, apos checar user ativo:
if (user.birthDate instanceof DateTime && user.birthDate.isValid) {
  const age = getAgeInYears(user.birthDate)
  if (age <= AGE_GATE_MAX) {
    return response.ok({ message: genericSuccessMessage })
  }
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/auth/send_code.spec.ts --tests "blocks otp for users age 14 or less with generic response"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/auth/send_code.ts tests/functional/auth/send_code.spec.ts
git commit -m "feat(auth): block otp send-code for users age 14 or less"
```

### Task 3: Cobrir caminhos permitidos (> 14 e sem birthDate)

**Files:**

- Modify: `tests/functional/auth/send_code.spec.ts`

**Step 1: Write the failing tests**

Adicionar dois testes:

1. usuario ativo com idade `> 14` envia e-mail;
2. usuario ativo sem `birthDate` envia e-mail.

```ts
test('allows otp for users older than 14', async ({ client }) => {
  // arrange user ativo > 14, mail fake
  // assert 200 generico + mail enviado
})

test('allows otp when birthDate is missing', async ({ client }) => {
  // arrange user ativo sem birthDate, mail fake
  // assert 200 generico + mail enviado
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/auth/send_code.spec.ts --tests "allows otp"`
Expected: pode falhar por fixtures incompletas ou assertions de mail.

**Step 3: Write minimal implementation**

Ajustar apenas fixtures/arrange dos testes para refletir corretamente a regra (sem alterar controller, se nao necessario).

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/auth/send_code.spec.ts`
Expected: PASS nos cenarios de bloqueio e permissao.

**Step 5: Commit**

```bash
git add tests/functional/auth/send_code.spec.ts
git commit -m "test(auth): cover send-code age gate allowlist scenarios"
```

### Task 4: Regressao de comportamento existente

**Files:**

- Modify: `tests/functional/auth/send_code.spec.ts`

**Step 1: Write the failing tests**

Adicionar testes para:

1. e-mail inexistente retorna 200 generico;
2. usuario inativo retorna 200 generico.

```ts
test('keeps generic response for unknown email', async ({ client, assert }) => {
  const response = await client
    .post('/api/v1/auth/send-code')
    .json({ email: 'unknown@example.com' })
  response.assertStatus(200)
  assert.equal(
    response.body().message,
    'Se o e-mail estiver cadastrado, enviaremos um codigo de acesso.'
  )
})

test('keeps generic response for inactive users', async ({ client }) => {
  // arrange user active=false
  // assert 200 generico
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/auth/send_code.spec.ts --tests "generic response"`
Expected: FAIL se fixtures/assertions estiverem incompletas.

**Step 3: Write minimal implementation**

Ajustar dados de teste para cobrir o comportamento atual sem alterar regra de negocio.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/auth/send_code.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/functional/auth/send_code.spec.ts
git commit -m "test(auth): preserve send-code generic response behavior"
```

### Task 5: Verificacao final de qualidade

**Files:**

- Modify: `app/controllers/auth/send_code.ts` (se necessario)
- Modify: `tests/functional/auth/send_code.spec.ts` (se necessario)

**Step 1: Run full relevant tests**

Run: `node ace test tests/functional/auth/send_code.spec.ts`
Expected: PASS total.

**Step 2: Run broader safety checks**

Run: `npm run typecheck && npm run lint`
Expected: sem erros novos causados pela mudanca.

**Step 3: Stabilize if failures appear**

Aplicar ajustes minimos e repetir comandos ate verde.

**Step 4: Final verification run**

Run: `node ace test tests/functional/auth/send_code.spec.ts && npm run typecheck`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/auth/send_code.ts tests/functional/auth/send_code.spec.ts
git commit -m "feat(auth): enforce age gate on otp send-code with api coverage"
```
