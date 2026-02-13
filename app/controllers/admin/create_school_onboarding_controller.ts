import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createSchoolOnboardingValidator } from '#validators/onboarding'
import { v7 as uuidv7 } from 'uuid'
import AppException from '#exceptions/app_exception'

interface SchoolRow {
  id: string
}

interface UserRow {
  id: string
  name: string
  email: string
}

interface RoleRow {
  id: string
}

interface PlatformSettingsRow {
  defaultTrialDays: number
  defaultPricePerStudent: number
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default class CreateSchoolOnboardingController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createSchoolOnboardingValidator)

    // Buscar configurações da plataforma
    const platformSettingsResult = await db.rawQuery<{ rows: PlatformSettingsRow[] }>(
      `SELECT "defaultTrialDays", "defaultPricePerStudent" FROM "PlatformSettings" LIMIT 1`
    )

    const platformSettings = platformSettingsResult.rows[0]
    if (!platformSettings) {
      throw AppException.internalServerError('Configurações da plataforma não encontradas')
    }

    // Verificar se a escola já existe com este nome
    const existingSchoolResult = await db.rawQuery<{ rows: SchoolRow[] }>(
      `SELECT id FROM "School" WHERE LOWER(name) = LOWER(:name) LIMIT 1`,
      { name: data.name }
    )

    if (existingSchoolResult.rows.length > 0) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    // Verificar se já existe usuário com este email
    const existingUserResult = await db.rawQuery<{ rows: UserRow[] }>(
      `SELECT id, name, email FROM "User" WHERE LOWER(email) = LOWER(:email) LIMIT 1`,
      { email: data.directorEmail }
    )

    // Buscar role de DIRECTOR
    const directorRoleResult = await db.rawQuery<{ rows: RoleRow[] }>(
      `SELECT id FROM "Role" WHERE name = 'SCHOOL_DIRECTOR' LIMIT 1`
    )

    if (directorRoleResult.rows.length === 0) {
      throw AppException.internalServerError('Role de diretor não encontrada no sistema')
    }

    const directorRole = directorRoleResult.rows[0]

    // Valores finais
    const finalTrialDays = data.trialDays ?? platformSettings.defaultTrialDays
    const finalPricePerStudent = data.pricePerStudent ?? platformSettings.defaultPricePerStudent
    const finalPlatformFeePercentage = data.platformFeePercentage ?? 5.0

    // Gerar IDs
    const schoolId = uuidv7()
    const slug = generateSlug(data.name)

    // Verificar se slug já existe e adicionar sufixo se necessário
    let finalSlug = slug
    let slugSuffix = 1
    let slugExists = true

    while (slugExists) {
      const slugCheckResult = await db.rawQuery<{ rows: SchoolRow[] }>(
        `SELECT id FROM "School" WHERE slug = :slug LIMIT 1`,
        { slug: finalSlug }
      )
      if (slugCheckResult.rows.length === 0) {
        slugExists = false
      } else {
        finalSlug = `${slug}-${slugSuffix}`
        slugSuffix++
      }
    }

    // Criar escola
    await db.rawQuery(
      `
      INSERT INTO "School" (
        id, name, slug, street, number, complement, neighborhood, city, state, "zipCode",
        latitude, longitude, "schoolChainId", "hasInsurance", "insurancePercentage",
        "insuranceCoveragePercentage", "insuranceClaimWaitingDays", "paymentConfigStatus",
        "usePlatformManagedPayments", "enablePaymentNotifications", "minimumGrade",
        "calculationAlgorithm", "minimumAttendancePercentage", "createdAt", "updatedAt"
      ) VALUES (
        :id, :name, :slug, :street, :number, :complement, :neighborhood, :city, :state, :zipCode,
        :latitude, :longitude, :schoolChainId, :hasInsurance, :insurancePercentage,
        :insuranceCoveragePercentage, :insuranceClaimWaitingDays, 'NOT_CONFIGURED',
        true, true, 7.0, 'AVERAGE', 75.0, NOW(), NOW()
      )
      `,
      {
        id: schoolId,
        name: data.name,
        slug: finalSlug,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        schoolChainId: data.schoolChainId || null,
        hasInsurance: data.hasInsurance || false,
        insurancePercentage: data.insurancePercentage || null,
        insuranceCoveragePercentage: data.insuranceCoveragePercentage || null,
        insuranceClaimWaitingDays: data.insuranceClaimWaitingDays || null,
      }
    )

    // Criar ou obter diretor
    let directorId: string
    let directorName: string
    let directorEmail: string

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0]
      directorId = existingUser.id
      directorName = existingUser.name
      directorEmail = existingUser.email
    } else {
      directorId = uuidv7()
      directorName = data.directorName
      directorEmail = data.directorEmail

      const directorSlug = data.directorEmail.split('@')[0] || data.directorEmail

      await db.rawQuery(
        `
        INSERT INTO "User" (
          id, name, slug, email, phone, "roleId", active, "whatsappContact", "grossSalary", "createdAt", "updatedAt"
        ) VALUES (
          :id, :name, :slug, :email, :phone, :roleId, true, false, 0, NOW(), NOW()
        )
        `,
        {
          id: directorId,
          name: data.directorName,
          slug: directorSlug,
          email: data.directorEmail,
          phone: data.directorPhone || null,
          roleId: directorRole.id,
        }
      )

      // Criar registro Teacher para o diretor
      await db.rawQuery(
        `
        INSERT INTO "Teacher" (id, "hourlyRate") VALUES (:id, 0)
        `,
        { id: directorId }
      )
    }

    // Associar diretor à escola
    await db.rawQuery(
      `
      INSERT INTO "UserHasSchool" (id, "userId", "schoolId", "isDefault", "createdAt", "updatedAt")
      VALUES (:id, :userId, :schoolId, true, NOW(), NOW())
      ON CONFLICT ("userId", "schoolId") DO NOTHING
      `,
      {
        id: uuidv7(),
        userId: directorId,
        schoolId: schoolId,
      }
    )

    // Criar PaymentSettings
    const paymentSettingsId = uuidv7()
    await db.rawQuery(
      `
      INSERT INTO "PaymentSettings" (
        id, "schoolId", "pricePerStudent", "trialDays", discount, "platformFeePercentage", "isActive", "createdAt", "updatedAt"
      ) VALUES (
        :id, :schoolId, :pricePerStudent, :trialDays, 0, :platformFeePercentage, true, NOW(), NOW()
      )
      `,
      {
        id: paymentSettingsId,
        schoolId: schoolId,
        pricePerStudent: finalPricePerStudent,
        trialDays: finalTrialDays,
        platformFeePercentage: finalPlatformFeePercentage,
      }
    )

    // Criar Subscription
    const subscriptionId = uuidv7()
    const now = new Date()
    const trialEndsAt = new Date(now)
    trialEndsAt.setDate(now.getDate() + finalTrialDays)

    await db.rawQuery(
      `
      INSERT INTO "Subscription" (
        id, "schoolId", status, "billingCycle", "currentPeriodStart", "currentPeriodEnd",
        "trialEndsAt", "pricePerStudent", "activeStudents", "monthlyAmount", discount, "createdAt", "updatedAt"
      ) VALUES (
        :id, :schoolId, 'TRIAL', 'MONTHLY', :currentPeriodStart, :currentPeriodEnd,
        :trialEndsAt, :pricePerStudent, 0, 0, 0, NOW(), NOW()
      )
      `,
      {
        id: subscriptionId,
        schoolId: schoolId,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: trialEndsAt.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        pricePerStudent: finalPricePerStudent,
      }
    )

    // Criar histórico de status
    await db.rawQuery(
      `
      INSERT INTO "SubscriptionStatusHistory" (
        id, "subscriptionId", "fromStatus", "toStatus", reason, "changedAt"
      ) VALUES (
        :id, :subscriptionId, NULL, 'TRIAL', :reason, NOW()
      )
      `,
      {
        id: uuidv7(),
        subscriptionId: subscriptionId,
        reason: `Assinatura criada durante onboarding - Trial de ${finalTrialDays} dias`,
      }
    )

    return response.created({
      school: {
        id: schoolId,
        name: data.name,
        slug: finalSlug,
      },
      director: {
        id: directorId,
        name: directorName,
        email: directorEmail,
      },
      subscription: {
        id: subscriptionId,
        status: 'TRIAL',
        trialEndsAt: trialEndsAt.toISOString(),
      },
    })
  }
}
