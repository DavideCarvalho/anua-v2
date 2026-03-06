import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

const STUDENT_NAME = `Aluno E2E ${Date.now()}`
const RESPONSIBLE_CPF = '11122233344'
const RESPONSIBLE_NAME = `Responsável E2E ${Date.now()}`
const RESPONSIBLE_EMAIL = `resp-e2e-${Date.now()}@example.com`
const RESPONSIBLE_PHONE = '11999999999'

const ADDRESS_STREET = 'Avenida Paulista'
const ADDRESS_NUMBER = '1000'
const ADDRESS_NEIGHBORHOOD = 'Bela Vista'
const ADDRESS_CITY = 'São Paulo'
const ADDRESS_STATE = 'SP'

async function selectAcademicPeriod(page: any, academicPeriodName: string) {
  const academicPeriodTrigger = page
    .locator('button[role="combobox"]:visible')
    .filter({ hasText: /selecione o período letivo|período teste/i })
    .first()

  await academicPeriodTrigger.waitFor({ state: 'visible', timeout: 30000 })
  await academicPeriodTrigger.click()

  const academicPeriodOption = page.getByRole('option', { name: academicPeriodName }).first()
  await academicPeriodOption.waitFor({ state: 'visible', timeout: 30000 })
  await academicPeriodOption.click()
}

test.group('Matricular aluno - E2E (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('completes full enrollment flow and student appears in list', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { academicPeriod, level } = await createEnrollmentFixtures(school)
    await browserContext!.loginAs(user)

    const page = await visit!('/escola/administrativo/matriculas/nova')

    // Wait for page and select academic period
    await selectAcademicPeriod(page, academicPeriod.name)

    // Step 0: Student info (child - no document/phone required)
    await page.getByLabel(/nome do aluno/i).fill(STUDENT_NAME)
    const birthDateChild = new Date()
    birthDateChild.setFullYear(birthDateChild.getFullYear() - 10)
    await page
      .getByLabel(/data de nascimento/i)
      .first()
      .fill(birthDateChild.toISOString().split('T')[0])
    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 1: Add responsible - CPF lookup then manual form
    await page.getByRole('button', { name: /adicionar responsável/i }).click()
    await page.getByPlaceholder(/000\.000\.000-00/i).fill('111.222.333-44')
    await page.getByRole('button', { name: /buscar/i }).click()

    // Wait for "Novo responsável" form (search returns not found)
    await page.locator('#guardian-name').waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('#guardian-name').fill(RESPONSIBLE_NAME)

    const birthDateAdult = new Date()
    birthDateAdult.setFullYear(birthDateAdult.getFullYear() - 35)
    await page.locator('#guardian-birthdate').fill(birthDateAdult.toISOString().split('T')[0])
    await page.getByPlaceholder('email@exemplo.com').first().fill(RESPONSIBLE_EMAIL)
    await page.locator('#guardian-phone').fill(RESPONSIBLE_PHONE)

    await page.getByRole('checkbox', { name: /pedagógico/i }).check()
    await page.getByRole('checkbox', { name: /financeiro/i }).check()
    await page.getByRole('checkbox', { name: /contato de emergência/i }).check()

    await page.getByRole('button', { name: /confirmar/i }).click()

    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 2: Address
    await page.locator('input[name="address.zipCode"]').fill('01310100')
    await page.locator('input[name="address.street"]').fill(ADDRESS_STREET)
    await page.locator('input[name="address.number"]').fill(ADDRESS_NUMBER)
    await page.locator('input[name="address.neighborhood"]').fill(ADDRESS_NEIGHBORHOOD)
    await page.locator('input[name="address.city"]').fill(ADDRESS_CITY)
    await page.locator('input[name="address.state"]').fill(ADDRESS_STATE)
    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 3: Medical - responsible is emergency contact, can skip or add
    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 4: Billing - select level (course auto-selected when only one)
    await page
      .getByRole('combobox')
      .filter({ hasText: /selecione o (ano escolar|semestre)/i })
      .first()
      .click()
    await page.getByRole('option', { name: level.name }).click()

    // Wait for contract to load and select payment method + date (required)
    await page.getByLabel(/forma de pagamento/i).click()
    await page.getByRole('option', { name: 'Boleto' }).click()
    await page.getByLabel(/dia de vencimento/i).click()
    await page.getByRole('option', { name: 'Dia 5' }).click()

    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 5: Review - wait for confirm button and click
    const confirmBtn = page.getByRole('button', { name: /confirmar matrícula/i })
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 })
    await confirmBtn.click()

    // Success: redirect to matrículas
    await page.assertPath('/escola/administrativo/matriculas')

    // Student should appear in alunos list
    await page.goto('/escola/administrativo/alunos')
    await page.getByPlaceholder('Buscar alunos...').fill(STUDENT_NAME)
    await page.assertTextContains('body', STUDENT_NAME)

    // Open edit page and verify all data was saved correctly
    const studentRow = page.locator('tr').filter({ hasText: STUDENT_NAME })
    await studentRow.getByRole('button').click()
    await page.getByRole('menuitem', { name: /editar aluno/i }).click()

    await page.waitForURL(/\/alunos\/[^/]+\/editar/, { timeout: 5000 })
    await page.getByRole('button', { name: /revisão/i }).click()

    // Verify data on review step
    await page.assertTextContains('body', STUDENT_NAME)
    await page.assertTextContains('body', RESPONSIBLE_NAME)
    await page.assertTextContains('body', ADDRESS_STREET)
    await page.assertTextContains('body', ADDRESS_NUMBER)
    await page.assertTextContains('body', ADDRESS_NEIGHBORHOOD)
    await page.assertTextContains('body', ADDRESS_CITY)
    await page.assertTextContains('body', ADDRESS_STATE)
  })
})
