import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "AbsenceReason" AS ENUM ('SICKNESS', 'PERSONAL_MATTERS', 'BLOOD_DONATION', 'ELECTION_JUDGE', 'VACATION', 'DAYOFF', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "AbsenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "AcademicPeriodSegment" AS ENUM ('KINDERGARTEN', 'ELEMENTARY', 'HIGHSCHOOL', 'TECHNICAL', 'UNIVERSITY', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "AchievementCategory" AS ENUM ('ACADEMIC', 'ATTENDANCE', 'BEHAVIOR', 'SOCIAL', 'SPECIAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "BalanceTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "BalanceTransactionType" AS ENUM ('TOP_UP', 'CANTEEN_PURCHASE', 'STORE_PURCHASE', 'REFUND', 'ADJUSTMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "ChallengeCategory" AS ENUM ('ACADEMIC', 'ATTENDANCE', 'BEHAVIOR', 'PARTICIPATION', 'SOCIAL', 'SPECIAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "ContractPaymentType" AS ENUM ('MONTHLY', 'UPFRONT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING_DOCUMENT_REVIEW', 'REGISTERED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "EventPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'POSTPONED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "EventType" AS ENUM ('ACADEMIC_EVENT', 'EXAM', 'ASSIGNMENT', 'FIELD_TRIP', 'PARENTS_MEETING', 'SCHOOL_CONFERENCE', 'CULTURAL_EVENT', 'SPORTS_EVENT', 'ARTS_SHOW', 'SCIENCE_FAIR', 'TALENT_SHOW', 'COMMUNITY_EVENT', 'FUNDRAISING', 'VOLUNTEER_DAY', 'SCHOOL_PARTY', 'STAFF_MEETING', 'TRAINING', 'SCHOOL_BOARD', 'HEALTH_CHECK', 'VACCINATION_DAY', 'MENTAL_HEALTH', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'STAFF_ONLY', 'PARENTS_ONLY', 'STUDENTS_ONLY', 'SPECIFIC_CLASSES', 'SPECIFIC_LEVELS');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "InsuranceBillingStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "InsuranceClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "LeaderboardType" AS ENUM ('POINTS', 'ATTENDANCE', 'GRADES', 'PARTICIPATION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "MealReservationStatus" AS ENUM ('RESERVED', 'SERVED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "NotificationType" AS ENUM ('ORDER_CREATED', 'ORDER_APPROVED', 'ORDER_REJECTED', 'ORDER_PREPARING', 'ORDER_READY', 'ORDER_DELIVERED', 'ACHIEVEMENT_UNLOCKED', 'CHALLENGE_STARTED', 'CHALLENGE_COMPLETED', 'CHALLENGE_EXPIRED', 'POINTS_RECEIVED', 'POINTS_DEDUCTED', 'LEVEL_UP', 'STREAK_MILESTONE', 'RANKING_POSITION_CHANGED', 'ASSIGNMENT_CREATED', 'ASSIGNMENT_GRADED', 'ASSIGNMENT_DUE_SOON', 'GRADE_PUBLISHED', 'ATTENDANCE_MARKED', 'PARENTAL_CONSENT_REQUESTED', 'PARENTAL_CONSENT_REMINDER', 'PARENTAL_CONSENT_APPROVED', 'PARENTAL_CONSENT_DENIED', 'PARENTAL_CONSENT_EXPIRED', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'LOW_BALANCE', 'CONFIG_WARNING_CRITICAL', 'CONFIG_WARNING', 'SYSTEM_ANNOUNCEMENT', 'MAINTENANCE_SCHEDULED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "OccurenceType" AS ENUM ('BEHAVIOR', 'PERFORMANCE', 'ABSENCE', 'LATE', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPROVED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "ParentalConsentStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PaymentConfigStatus" AS ENUM ('NOT_CONFIGURED', 'PENDING_DOCUMENTS', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PaymentGateway" AS ENUM ('ASAAS', 'CUSTOM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PaymentMode" AS ENUM ('POINTS_ONLY', 'MONEY_ONLY', 'HYBRID');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PaymentStatus" AS ENUM ('NOT_PAID', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PaymentType" AS ENUM ('ENROLLMENT', 'TUITION', 'CANTEEN', 'COURSE', 'AGREEMENT', 'STUDENT_LOAN', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PixKeyType" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "RecurrencePeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "ScholarshipType" AS ENUM ('PHILANTHROPIC', 'DISCOUNT', 'COMPANY_PARTNERSHIP', 'FREE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "SchoolGroupType" AS ENUM ('CITY', 'STATE', 'CUSTOM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SIGNED', 'DECLINED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StoreCategory" AS ENUM ('CANTEEN_FOOD', 'CANTEEN_DRINK', 'SCHOOL_SUPPLY', 'PRIVILEGE', 'HOMEWORK_PASS', 'UNIFORM', 'BOOK', 'MERCHANDISE', 'DIGITAL', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StudentDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StudentEmergencyContactRelationship" AS ENUM ('MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'COUSIN', 'NEPHEW', 'NIECE', 'GUARDIAN', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "SubscriptionLevel" AS ENUM ('NETWORK', 'INDIVIDUAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'BLOCKED', 'CANCELED', 'PAUSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "TimesheetStatus" AS ENUM ('OPEN', 'CLOSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "TransactionType" AS ENUM ('EARNED', 'SPENT', 'ADJUSTED', 'PENALTY', 'BONUS', 'REFUND');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "TransferStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "TuitionTransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY_PENDING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "WebhookEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "WebhookProvider" AS ENUM ('ASAAS', 'ASAAS_RECARGA', 'DOCUSEAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "WebhookProvider" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "WebhookEventStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "TuitionTransferStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "TransferStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "TransactionType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "TimesheetStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "SubscriptionTier" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "SubscriptionLevel" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "StudentEmergencyContactRelationship" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "StudentDocumentStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "StoreCategory" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "SignatureStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "SchoolGroupType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "ScholarshipType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "RecurrencePeriod" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PixKeyType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PaymentType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PaymentStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PaymentMode" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PaymentGateway" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PaymentConfigStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "ParentalConsentStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "OrderStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "OccurenceType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "NotificationType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "MealType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "MealReservationStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "LeaderboardType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "InsuranceClaimStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "InsuranceBillingStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "EventVisibility" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "EventType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "EventStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "EventPriority" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "EnrollmentStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "ContractPaymentType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "ChallengeCategory" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "BillingCycle" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "BalanceTransactionType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "BalanceTransactionStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "AttendanceStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "AchievementRarity" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "AchievementCategory" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "AcademicPeriodSegment" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "AbsenceStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "AbsenceReason" CASCADE')
  }
}
