import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'
import ContractPaymentDay from '#models/contract_payment_day'
import Invoice from '#models/invoice'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import User from '#models/user'

const STUDENT_NAME_ORIGINAL = `Aluno Edit E2E ${Date.now()}`
const STUDENT_NAME_EDITED = `Aluno Editado E2E ${Date.now()}`

const RESPONSIBLE_1_NAME = `Responsável Edit E2E ${Date.now()}`
const RESPONSIBLE_1_EMAIL = `resp-edit-e2e-${Date.now()}@example.com`
const RESPONSIBLE_1_EMAIL_EDITED = `resp-edit-updated-e2e-${Date.now()}@example.com`
const RESPONSIBLE_1_PHONE = '11999999999'
const RESPONSIBLE_1_PHONE_EDITED = '11988887777'
const RESPONSIBLE_1_DOCUMENT = '11122233344'

const RESPONSIBLE_2_NAME = `Responsável 2 Edit E2E ${Date.now()}`
const RESPONSIBLE_2_EMAIL = `resp2-edit-e2e-${Date.now()}@example.com`
const RESPONSIBLE_2_PHONE = '11888888888'
const RESPONSIBLE_2_DOCUMENT = '55566677788'

const ADDRESS_STREET = 'Avenida Paulista'
const ADDRESS_NUMBER = '1000'
const ADDRESS_NUMBER_EDITED = '2000'
const ADDRESS_NEIGHBORHOOD = 'Bela Vista'
const ADDRESS_CITY = 'São Paulo'
const ADDRESS_CITY_EDITED = 'Santos'
const ADDRESS_STATE = 'SP'
const ADDRESS_COMPLEMENT_EDITED = 'Sala 501'

const MEDICAL_CONDITION = 'Asma leve'
const MEDICAL_CONDITION_EDITED = 'Asma moderada'
const MEDICATION_NAME = 'Salbutamol'
const MEDICATION_DOSAGE = '100mcg'
const MEDICATION_DOSAGE_EDITED = '200mcg'
const MEDICATION_FREQUENCY = 'Conforme necessário'
const MEDICATION_INSTRUCTIONS = 'Usar em caso de crise'

const EMERGENCY_CONTACT_NAME = 'Tia Maria'
const EMERGENCY_CONTACT_PHONE = '11777777777'
const EMERGENCY_CONTACT_NAME_EDITED = 'Tio João'
const EMERGENCY_CONTACT_PHONE_EDITED = '11666666666'
const EMERGENCY_CONTACT_EXTRA_NAME = 'Vizinha Ana'
const EMERGENCY_CONTACT_EXTRA_PHONE = '11555555555'

function isoDateYearsAgo(years: number) {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date.toISOString().split('T')[0]
}

async function addResponsible(
  page: any,
  options: {
    document: string
    name: string
    email: string
    phone: string
    birthYearsAgo: number
    pedagogical: boolean
    financial: boolean
    emergency: boolean
  }
) {
  await page.getByRole('button', { name: /adicionar responsável/i }).click()
  await page.getByPlaceholder(/000\.000\.000-00/i).fill(options.document)
  await page.getByRole('button', { name: /buscar/i }).click()

  await page.locator('#guardian-name').waitFor({ state: 'visible', timeout: 5000 })
  await page.locator('#guardian-name').fill(options.name)
  await page.locator('#guardian-birthdate').fill(isoDateYearsAgo(options.birthYearsAgo))
  await page.getByPlaceholder('email@exemplo.com').first().fill(options.email)
  await page.locator('#guardian-phone').fill(options.phone)

  if (options.pedagogical) {
    await page.getByRole('checkbox', { name: /pedagógico/i }).check()
  }
  if (options.financial) {
    await page.getByRole('checkbox', { name: /financeiro/i }).check()
  }
  if (!options.emergency) {
    await page.getByRole('checkbox', { name: /contato de emergência/i }).uncheck()
  }

  await page.getByRole('button', { name: /confirmar/i }).click()
}

async function waitForPaymentsAndInvoices(studentId: string) {
  const timeoutMs = 12000
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const payments = await StudentPayment.query()
      .where('studentId', studentId)
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      .whereNotIn('type', ['AGREEMENT'])

    const invoices = await Invoice.query()
      .where('studentId', studentId)
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

    const hasInvoiceLinkedPayment = payments.some((payment) => !!payment.invoiceId)
    if (payments.length > 0 && invoices.length > 0 && hasInvoiceLinkedPayment) {
      return { payments, invoices }
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  return { payments: [], invoices: [] }
}

async function waitForEnrollmentBillingUpdateById(enrollmentId: string) {
  const timeoutMs = 12000
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const enrollment = await StudentHasLevel.query()
      .where('id', enrollmentId)
      .whereNull('deletedAt')
      .first()

    if (enrollment?.paymentMethod === 'PIX' && enrollment.paymentDay === 10) {
      return enrollment
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  return null
}

async function selectAcademicPeriod(page: any, academicPeriodName: string) {
  // First, verify API is accessible and returns data
  const apiResponse = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/v1/academic-periods?limit=50')
      const data = await response.json()
      return { status: response.status, data }
    } catch (error: any) {
      return { error: error.message }
    }
  })

  console.log('API Response:', JSON.stringify(apiResponse).substring(0, 500))

  if (apiResponse.error) {
    throw new Error(`API request failed: ${apiResponse.error}`)
  }

  if (!apiResponse.data?.data?.length) {
    throw new Error(
      `API returned no academic periods. Response: ${JSON.stringify(apiResponse.data)}`
    )
  }

  const trigger = page
    .locator('button[role="combobox"]:visible')
    .filter({ hasText: /selecione o período letivo|período teste/i })
    .first()

  await trigger.waitFor({ state: 'visible', timeout: 30000 })
  await trigger.click()

  // Wait for dropdown to open and React Query to potentially load data
  // In CI, resources are limited, so we give more time
  await page.waitForTimeout(3000)

  // Check for options - wait up to 30s total
  const maxWaitTime = 30000
  const checkInterval = 1000
  let totalWaitTime = 0
  let found = false

  while (totalWaitTime < maxWaitTime) {
    const optionCount = await page.locator('[role="option"]').count()
    console.log(`Option count after ${totalWaitTime}ms: ${optionCount}`)
    if (optionCount > 0) {
      found = true
      break
    }
    await page.waitForTimeout(checkInterval)
    totalWaitTime += checkInterval
  }

  if (!found) {
    throw new Error(`No options found after ${maxWaitTime}ms timeout`)
  }

  const option = page.getByRole('option', { name: academicPeriodName }).first()
  await option.waitFor({ state: 'visible', timeout: 5000 })
  await option.click()
}

test.group('Editar aluno - E2E (browser)', (group) => {
  test('enrolls via UI, edits all sections, and validates payments/invoices', async (ctx: any) => {
    const { visit, browserContext, assert } = ctx

    const { user, school } = await createEscolaAuthUser()
    const { academicPeriod, level, contract, classEntity } = await createEnrollmentFixtures(school)
    await ContractPaymentDay.firstOrCreate({ contractId: contract.id, day: 10 })

    await browserContext.loginAs(user)

    // Create student via full UI enrollment flow
    const page = await visit('/escola/administrativo/matriculas/nova')
    await page.waitForURL('**/matriculas/nova**', { timeout: 10000 })

    await selectAcademicPeriod(page, academicPeriod.name)

    await page.getByLabel(/nome do aluno/i).fill(STUDENT_NAME_ORIGINAL)
    await page
      .getByLabel(/data de nascimento/i)
      .first()
      .fill(isoDateYearsAgo(10))
    await page.getByRole('button', { name: /próximo/i }).click()

    await addResponsible(page, {
      document: '111.222.333-44',
      name: RESPONSIBLE_1_NAME,
      email: RESPONSIBLE_1_EMAIL,
      phone: RESPONSIBLE_1_PHONE,
      birthYearsAgo: 35,
      pedagogical: true,
      financial: true,
      emergency: true,
    })

    await addResponsible(page, {
      document: '555.666.777-88',
      name: RESPONSIBLE_2_NAME,
      email: RESPONSIBLE_2_EMAIL,
      phone: RESPONSIBLE_2_PHONE,
      birthYearsAgo: 40,
      pedagogical: false,
      financial: false,
      emergency: false,
    })

    await page.getByRole('button', { name: /próximo/i }).click()

    await page.locator('input[name="address.zipCode"]').fill('01310100')
    await page.locator('input[name="address.street"]').fill(ADDRESS_STREET)
    await page.locator('input[name="address.number"]').fill(ADDRESS_NUMBER)
    await page.locator('input[name="address.neighborhood"]').fill(ADDRESS_NEIGHBORHOOD)
    await page.locator('input[name="address.city"]').fill(ADDRESS_CITY)
    await page.locator('input[name="address.state"]').fill(ADDRESS_STATE)
    await page.getByRole('button', { name: /próximo/i }).click()

    await page.getByLabel(/condições e alergias/i).fill(MEDICAL_CONDITION)
    await page
      .getByRole('button', { name: /^adicionar$/i })
      .first()
      .click()
    await page.getByPlaceholder('Nome do medicamento').first().fill(MEDICATION_NAME)
    await page.getByPlaceholder('Ex: 500mg').first().fill(MEDICATION_DOSAGE)
    await page.getByPlaceholder('Ex: 2x ao dia').first().fill(MEDICATION_FREQUENCY)
    await page.getByPlaceholder('Instruções adicionais').first().fill(MEDICATION_INSTRUCTIONS)

    await page
      .getByRole('button', { name: /^adicionar$/i })
      .nth(1)
      .click()
    await page.getByPlaceholder('Nome do contato').first().fill(EMERGENCY_CONTACT_NAME)
    await page.getByPlaceholder('11999999999').first().fill(EMERGENCY_CONTACT_PHONE)
    await page.getByRole('button', { name: /próximo/i }).click()

    await page
      .getByRole('combobox')
      .filter({ hasText: /selecione o (ano escolar|semestre)/i })
      .first()
      .click()
    await page.getByRole('option', { name: level.name }).click()
    await page
      .getByRole('combobox')
      .filter({ hasText: /selecione a turma/i })
      .click()
    await page.getByRole('option', { name: classEntity.name }).click()

    await page.getByLabel(/forma de pagamento/i).click()
    await page.getByRole('option', { name: 'Boleto' }).click()
    await page.getByLabel(/dia de vencimento/i).click()
    await page.getByRole('option', { name: 'Dia 5' }).click()
    await page.getByRole('button', { name: /próximo/i }).click()

    await page.getByRole('button', { name: /confirmar matrícula/i }).click()
    await page.assertPath('/escola/administrativo/matriculas')

    // Open edit flow
    await page.goto('/escola/administrativo/alunos')
    await page.getByPlaceholder('Buscar alunos...').fill(STUDENT_NAME_ORIGINAL)
    await page.assertTextContains('body', STUDENT_NAME_ORIGINAL)

    const originalStudentUser = await User.query().where('name', STUDENT_NAME_ORIGINAL).first()
    assert.exists(originalStudentUser)
    await page.goto(`/escola/administrativo/alunos/${originalStudentUser!.id}/editar`)
    await page.waitForURL(/\/alunos\/[^/]+\/editar/, { timeout: 5000 })
    const studentEditPath = page.url()

    // Step 0 - student info
    await page.getByLabel(/nome do aluno/i).fill(STUDENT_NAME_EDITED)
    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 1 - responsibles: edit first and remove second
    await page.locator('button:has(svg.lucide-pencil)').first().click()
    await page.getByPlaceholder('email@exemplo.com').last().fill(RESPONSIBLE_1_EMAIL_EDITED)
    await page.locator('input[id^="edit-phone-"]').first().fill(RESPONSIBLE_1_PHONE_EDITED)
    await page.getByRole('button', { name: /^salvar$/i }).click()
    await page.locator('button:has(svg.lucide-x)').last().click()
    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 2 - address
    await page.locator('input[name="address.number"]').fill(ADDRESS_NUMBER_EDITED)
    await page.locator('input[name="address.complement"]').fill(ADDRESS_COMPLEMENT_EDITED)
    await page.locator('input[name="address.city"]').fill(ADDRESS_CITY_EDITED)
    await page.getByRole('button', { name: /próximo/i }).click()

    // Step 3 - medical: edit/remove/add medication and emergency contacts
    await page.getByLabel(/condições e alergias/i).fill(MEDICAL_CONDITION_EDITED)
    await page.locator('button:has(svg.lucide-trash2)').first().click()
    await page
      .getByRole('button', { name: /^adicionar$/i })
      .first()
      .click()
    await page.getByPlaceholder('Nome do medicamento').first().fill(MEDICATION_NAME)
    await page.getByPlaceholder('Ex: 500mg').first().fill(MEDICATION_DOSAGE_EDITED)
    await page.getByPlaceholder('Ex: 2x ao dia').first().fill(MEDICATION_FREQUENCY)
    await page.getByPlaceholder('Instruções adicionais').first().fill(MEDICATION_INSTRUCTIONS)

    await page.getByPlaceholder('Nome do contato').first().fill(EMERGENCY_CONTACT_NAME_EDITED)
    await page.getByPlaceholder('11999999999').first().fill(EMERGENCY_CONTACT_PHONE_EDITED)

    await page
      .getByRole('button', { name: /^adicionar$/i })
      .nth(1)
      .click()
    await page.getByPlaceholder('Nome do contato').nth(1).fill(EMERGENCY_CONTACT_EXTRA_NAME)
    await page.getByPlaceholder('11999999999').nth(1).fill(EMERGENCY_CONTACT_EXTRA_PHONE)
    await page.locator('button:has(svg.lucide-trash2)').last().click()
    await page.getByRole('button', { name: /cobrança/i }).click()

    // Step 4 - billing
    const paymentCard = page.locator('div').filter({ hasText: 'Informações de Pagamento' }).first()
    await paymentCard.waitFor({ state: 'visible', timeout: 10000 })
    const paymentMethodSelect = paymentCard.locator(
      'xpath=.//label[contains(normalize-space(),"Forma de Pagamento")]/following::button[@role="combobox"][1]'
    )
    const paymentDaySelect = paymentCard.locator(
      'xpath=.//label[contains(normalize-space(),"Dia de Vencimento")]/following::button[@role="combobox"][1]'
    )

    await paymentMethodSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /^PIX$/ }).last().click({ force: true })
    await paymentDaySelect.click()
    await page
      .locator('[role="option"]')
      .filter({ hasText: /^Dia 10$/ })
      .last()
      .click({ force: true })
    await page.getByRole('button', { name: /próximo/i }).click()
    await page.assertTextContains('body', 'Responsáveis')

    // Step 5 - finish update
    await page
      .getByRole('button', { name: /salvar alterações/i })
      .last()
      .click()
    await page.assertPath('/escola/administrativo/alunos')

    // Re-open edit page and verify persistence field by field
    await page.goto(studentEditPath)
    await page.waitForURL(/\/alunos\/[^/]+\/editar/, { timeout: 5000 })

    assert.equal(await page.getByLabel(/nome do aluno/i).inputValue(), STUDENT_NAME_EDITED)
    await page.getByRole('button', { name: /próximo/i }).click()

    await page.locator('button:has(svg.lucide-pencil)').first().click()
    assert.equal(
      await page.locator('input[id^="edit-phone-"]').first().inputValue(),
      RESPONSIBLE_1_PHONE_EDITED
    )
    await page
      .getByRole('button', { name: /cancelar/i })
      .first()
      .click()
    assert.equal(await page.getByText(RESPONSIBLE_2_NAME).count(), 0)
    await page.getByRole('button', { name: /próximo/i }).click()

    assert.equal(
      await page.locator('input[name="address.number"]').inputValue(),
      ADDRESS_NUMBER_EDITED
    )
    assert.equal(
      await page.locator('input[name="address.complement"]').inputValue(),
      ADDRESS_COMPLEMENT_EDITED
    )
    assert.equal(await page.locator('input[name="address.city"]').inputValue(), ADDRESS_CITY_EDITED)
    await page.getByRole('button', { name: /próximo/i }).click()

    assert.equal(
      await page.getByLabel(/condições e alergias/i).inputValue(),
      MEDICAL_CONDITION_EDITED
    )
    assert.equal(
      await page.getByPlaceholder('Nome do medicamento').first().inputValue(),
      MEDICATION_NAME
    )
    assert.equal(
      await page.getByPlaceholder('Ex: 500mg').first().inputValue(),
      MEDICATION_DOSAGE_EDITED
    )
    assert.equal(
      await page.getByPlaceholder('Nome do contato').first().inputValue(),
      EMERGENCY_CONTACT_NAME_EDITED
    )
    assert.equal(
      await page.getByPlaceholder('11999999999').first().inputValue(),
      EMERGENCY_CONTACT_PHONE_EDITED
    )
    await page.getByRole('button', { name: /próximo/i }).click()

    // Billing update via dedicated payment modal (stable flow)
    await page.goto('/escola/administrativo/alunos')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.getByPlaceholder('Buscar alunos...').fill(STUDENT_NAME_EDITED)
    await page.waitForTimeout(3000)
    await page.assertTextContains('body', STUDENT_NAME_EDITED)

    const editedStudentRow = page.locator('tr').filter({ hasText: STUDENT_NAME_EDITED })
    await editedStudentRow.getByRole('button').click()
    const editPaymentMenuItem = page.getByRole('menuitem', { name: /editar pagamento/i }).first()
    await editPaymentMenuItem.waitFor({ state: 'visible', timeout: 5000 })
    await editPaymentMenuItem.click({ force: true })

    const paymentModalCard = page
      .locator('div')
      .filter({ hasText: 'Informações de Pagamento' })
      .first()
    await paymentModalCard.waitFor({ state: 'visible', timeout: 10000 })

    const modalPaymentMethodSelect = paymentModalCard.locator(
      'xpath=.//label[contains(normalize-space(),"Forma de Pagamento")]/following::button[@role="combobox"][1]'
    )
    const modalPaymentDaySelect = paymentModalCard.locator(
      'xpath=.//label[contains(normalize-space(),"Dia de Vencimento")]/following::button[@role="combobox"][1]'
    )

    await modalPaymentMethodSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /^PIX$/ }).last().click({ force: true })
    await modalPaymentDaySelect.click()
    await page
      .locator('[role="option"]')
      .filter({ hasText: /^Dia 10$/ })
      .last()
      .click({ force: true })

    const enrollmentUpdateRequest = await Promise.all([
      page.waitForRequest(
        (request: any) => {
          return (
            request.method() === 'PATCH' &&
            /\/api\/v1\/students\/[^/]+\/enrollments\/[^/]+$/.test(new URL(request.url()).pathname)
          )
        },
        { timeout: 10000 }
      ),
      page
        .getByRole('button', { name: /salvar alterações/i })
        .last()
        .click(),
    ]).then(([request]) => request)

    const enrollmentUpdatePayload = enrollmentUpdateRequest.postDataJSON() as {
      paymentMethod?: string
      paymentDay?: number
    } | null
    if (enrollmentUpdatePayload) {
      assert.equal(enrollmentUpdatePayload.paymentMethod, 'PIX')
      assert.equal(enrollmentUpdatePayload.paymentDay, 10)
    }

    const enrollmentUpdateResponse = await enrollmentUpdateRequest.response()
    assert.exists(enrollmentUpdateResponse)
    assert.equal(enrollmentUpdateResponse!.status(), 200)

    const requestPathParts = new URL(enrollmentUpdateRequest.url()).pathname.split('/')
    const enrollmentIdFromRequest = requestPathParts[requestPathParts.length - 1]

    // Validate payments and invoices were generated/reconciled for this student
    const updatedStudentUser = await User.query().where('name', STUDENT_NAME_EDITED).first()
    assert.exists(updatedStudentUser)

    const updatedEnrollment = await waitForEnrollmentBillingUpdateById(enrollmentIdFromRequest)
    assert.exists(updatedEnrollment)

    const { payments, invoices } = await waitForPaymentsAndInvoices(updatedStudentUser!.id)
    assert.isAbove(payments.length, 0)
    assert.isAbove(invoices.length, 0)
    assert.isTrue(payments.some((payment) => !!payment.invoiceId))

    const paymentWithDueDay10 = payments.find(
      (payment) => payment.type !== 'ENROLLMENT' && payment.dueDate?.day === 10
    )
    assert.exists(paymentWithDueDay10)

    const invoiceWithDueDay10 = invoices.find((invoice) => invoice.dueDate?.day === 10)
    assert.exists(invoiceWithDueDay10)
  })
})
