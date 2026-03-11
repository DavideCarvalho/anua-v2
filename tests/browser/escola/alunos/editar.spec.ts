import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

async function createStudentForEdit(
  school: Awaited<ReturnType<typeof createEscolaAuthUser>>['school']
) {
  const fixtures = await createEnrollmentFixtures(school)
  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })

  const uniqueSeed = Date.now()
  const studentUser = await User.create({
    name: `Aluno Editar ${uniqueSeed}`,
    slug: `aluno-editar-${uniqueSeed}`,
    email: `aluno-editar-${uniqueSeed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: studentRole.id,
  })

  const student = await Student.create({
    id: studentUser.id,
    contractId: fixtures.contract.id,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
    monthlyPaymentAmount: fixtures.contract.ammount,
    isSelfResponsible: false,
    paymentDate: 5,
    descountPercentage: 0,
  })

  await StudentHasLevel.create({
    studentId: student.id,
    levelAssignedToCourseAcademicPeriodId: fixtures.levelAssignment.id,
    academicPeriodId: fixtures.academicPeriod.id,
    levelId: fixtures.level.id,
    classId: fixtures.classEntity.id,
    contractId: fixtures.contract.id,
  })

  return student.id
}

test.group('Editar aluno - E2E (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('loads edit student page', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    const studentId = await createStudentForEdit(school)

    await browserContext.loginAs(user)

    const page = await visit(`/escola/administrativo/alunos/${studentId}/editar`)

    // The page should either load the edit form or show "not found"
    // Either way, it should not redirect to login
    const currentPath = await page.url()
    if (currentPath.includes('/login')) {
      throw new Error('Should not redirect to login for authenticated user')
    }
  })

  test('redirects unauthenticated users to login', async ({ visit }) => {
    const page = await visit(
      '/escola/administrativo/alunos/11111111-1111-4111-8111-111111111111/editar'
    )
    await page.assertPath('/login')
  })

  test('shows Salvar button before final step', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    const studentId = await createStudentForEdit(school)

    await browserContext.loginAs(user)

    const page = await visit(`/escola/administrativo/alunos/${studentId}/editar`)

    await page.waitForTimeout(2000)
    await page.assertExists('button:has-text("Salvar")')
    const saveWithAsterisk = await page.locator('button:has-text("Salvar *")').count()
    if (saveWithAsterisk > 0) {
      throw new Error('Save label should not contain an asterisk')
    }
    await page.assertExists('button:has-text("Próximo")')
  })

  test('asks confirmation when canceling with unsaved changes', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const studentId = await createStudentForEdit(school)

    await browserContext.loginAs(user)

    const page = await visit(`/escola/administrativo/alunos/${studentId}/editar`)

    await page.waitForTimeout(2000)

    await page.fill('input[placeholder="Nome completo"]', 'Aluno alterado')

    await page.assertExists('[data-slot="unsaved-form-indicator"]')
    await page.assertExists('[data-slot="step-unsaved-dot"]')

    const changedStepZeroDots = await page.locator('[data-step-unsaved-dot="0"]').count()
    if (changedStepZeroDots < 1) {
      throw new Error('Step 0 should show unsaved marker after editing student name')
    }

    await page.click('button:has-text("Próximo")')

    const changedStepZeroDotsAfterNavigate = await page
      .locator('[data-step-unsaved-dot="0"]')
      .count()
    if (changedStepZeroDotsAfterNavigate < 1) {
      throw new Error('Step 0 marker should persist after navigating to the next step')
    }

    const changedStepOneDots = await page.locator('[data-step-unsaved-dot="1"]').count()
    if (changedStepOneDots > 0) {
      throw new Error('Step 1 should not inherit unsaved marker from step 0 changes')
    }

    await page.evaluate(() => {
      ;(window as any).__confirmCalls = 0
      window.confirm = () => {
        ;(window as any).__confirmCalls += 1
        return false
      }
    })

    await page.click('button:has-text("Cancelar")')

    const confirmCalls = await page.evaluate(() => (window as any).__confirmCalls || 0)
    if (confirmCalls < 1) {
      throw new Error('Should ask for confirmation when there are unsaved changes')
    }

    await page.assertPathContains('/escola/administrativo/alunos/')
  })
})
