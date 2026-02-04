import vine from '@vinejs/vine'

// ==========================================
// Gamification Event Types and Entity Types
// ==========================================
const gamificationEventTypes = [
  'ASSIGNMENT_COMPLETED',
  'ASSIGNMENT_SUBMITTED',
  'ASSIGNMENT_GRADED',
  'ATTENDANCE_MARKED',
  'ATTENDANCE_PRESENT',
  'ATTENDANCE_LATE',
  'GRADE_RECEIVED',
  'GRADE_EXCELLENT',
  'GRADE_GOOD',
  'BEHAVIOR_POSITIVE',
  'BEHAVIOR_NEGATIVE',
  'PARTICIPATION_CLASS',
  'PARTICIPATION_EVENT',
  'STORE_PURCHASE',
  'STORE_ORDER_APPROVED',
  'STORE_ORDER_DELIVERED',
  'POINTS_MANUAL_ADD',
  'POINTS_MANUAL_REMOVE',
  'ACHIEVEMENT_UNLOCKED',
] as const

const entityTypes = [
  'Assignment',
  'Attendance',
  'Grade',
  'Behavior',
  'Participation',
  'StoreOrder',
  'Manual',
  'Achievement',
] as const

// ==========================================
// Achievement Validators
// ==========================================
export const createAchievementValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().minLength(1).maxLength(1000),
    icon: vine.string().trim().optional(),
    points: vine.number().min(0),
    category: vine.enum(['ACADEMIC', 'ATTENDANCE', 'BEHAVIOR', 'SOCIAL', 'SPECIAL']),
    criteria: vine.any(), // JSON with criteria
    isSecret: vine.boolean().optional(),
    rarity: vine.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
    maxUnlocks: vine.number().min(1).optional(),
    recurrencePeriod: vine.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL']).optional(),
    schoolId: vine.string().trim().optional(),
    schoolChainId: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateAchievementValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().minLength(1).maxLength(1000).optional(),
    icon: vine.string().trim().optional(),
    points: vine.number().min(0).optional(),
    category: vine.enum(['ACADEMIC', 'ATTENDANCE', 'BEHAVIOR', 'SOCIAL', 'SPECIAL']).optional(),
    criteria: vine.any().optional(),
    isSecret: vine.boolean().optional(),
    rarity: vine.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
    maxUnlocks: vine.number().min(1).optional(),
    recurrencePeriod: vine.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL']).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listAchievementsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    schoolChainId: vine.string().trim().optional(),
    category: vine.enum(['ACADEMIC', 'ATTENDANCE', 'BEHAVIOR', 'SOCIAL', 'SPECIAL']).optional(),
    rarity: vine.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Store Item Validators
// ==========================================
export const createStoreItemValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    storeId: vine.string().trim().optional(),
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    price: vine.number().min(1), // Em pontos
    paymentMode: vine.enum(['POINTS_ONLY', 'MONEY_ONLY', 'HYBRID']),
    pointsToMoneyRate: vine.number().min(1).optional(), // Default 100
    minPointsPercentage: vine.number().min(0).max(100).optional(),
    maxPointsPercentage: vine.number().min(0).max(100).optional(),
    category: vine.enum([
      'CANTEEN_FOOD',
      'CANTEEN_DRINK',
      'SCHOOL_SUPPLY',
      'PRIVILEGE',
      'HOMEWORK_PASS',
      'UNIFORM',
      'BOOK',
      'MERCHANDISE',
      'DIGITAL',
      'OTHER',
    ]),
    imageUrl: vine.string().trim().url().optional(),
    totalStock: vine.number().min(0).optional(), // null = unlimited
    maxPerStudent: vine.number().min(1).optional(),
    maxPerStudentPeriod: vine.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL']).optional(),
    preparationTimeMinutes: vine.number().min(0).optional(),
    requiresApproval: vine.boolean().optional(),
    pickupLocation: vine.string().trim().maxLength(255).optional(),
    canteenItemId: vine.string().trim().optional(), // Link to CanteenItem
    availableFrom: vine.date().optional(),
    availableUntil: vine.date().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateStoreItemValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    price: vine.number().min(1).optional(),
    paymentMode: vine.enum(['POINTS_ONLY', 'MONEY_ONLY', 'HYBRID']).optional(),
    pointsToMoneyRate: vine.number().min(1).optional(),
    minPointsPercentage: vine.number().min(0).max(100).optional(),
    maxPointsPercentage: vine.number().min(0).max(100).optional(),
    category: vine
      .enum([
        'CANTEEN_FOOD',
        'CANTEEN_DRINK',
        'SCHOOL_SUPPLY',
        'PRIVILEGE',
        'HOMEWORK_PASS',
        'UNIFORM',
        'BOOK',
        'MERCHANDISE',
        'DIGITAL',
        'OTHER',
      ])
      .optional(),
    imageUrl: vine.string().trim().url().optional(),
    totalStock: vine.number().min(0).optional(),
    maxPerStudent: vine.number().min(1).optional(),
    maxPerStudentPeriod: vine.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL']).optional(),
    preparationTimeMinutes: vine.number().min(0).optional(),
    requiresApproval: vine.boolean().optional(),
    pickupLocation: vine.string().trim().maxLength(255).optional(),
    availableFrom: vine.date().optional(),
    availableUntil: vine.date().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listStoreItemsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    category: vine
      .enum([
        'CANTEEN_FOOD',
        'CANTEEN_DRINK',
        'SCHOOL_SUPPLY',
        'PRIVILEGE',
        'HOMEWORK_PASS',
        'UNIFORM',
        'BOOK',
        'MERCHANDISE',
        'DIGITAL',
        'OTHER',
      ])
      .optional(),
    paymentMode: vine.enum(['POINTS_ONLY', 'MONEY_ONLY', 'HYBRID']).optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Store Order Validators
// ==========================================
export const createStoreOrderValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    schoolId: vine.string().trim(),
    storeId: vine.string().trim().optional(),
    items: vine.array(
      vine.object({
        storeItemId: vine.string().trim(),
        quantity: vine.number().min(1),
      })
    ),
    paymentMode: vine.enum(['IMMEDIATE', 'DEFERRED']).optional(),
    paymentMethod: vine.enum(['BALANCE', 'PIX', 'CASH', 'CARD']).optional(),
    installments: vine.number().min(1).max(12).optional(),
    dueDate: vine.date().optional(),
    pointsPaid: vine.number().min(0).optional(),
    moneyPaid: vine.number().min(0).optional(), // Em centavos
    notes: vine.string().trim().maxLength(500).optional(),
  })
)

export const listStoreOrdersValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    studentId: vine.string().trim().optional(),
    status: vine
      .enum([
        'PENDING_PAYMENT',
        'PENDING_APPROVAL',
        'APPROVED',
        'PREPARING',
        'READY',
        'DELIVERED',
        'CANCELED',
        'REJECTED',
      ])
      .optional(),
    search: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const updateStoreOrderStatusValidator = vine.compile(
  vine.object({
    status: vine.enum([
      'PENDING_PAYMENT',
      'PENDING_APPROVAL',
      'APPROVED',
      'PREPARING',
      'READY',
      'DELIVERED',
      'CANCELED',
      'REJECTED',
    ]),
    estimatedReadyAt: vine.date().optional(),
    rejectionReason: vine.string().trim().maxLength(500).optional(),
  })
)

export const rejectStoreOrderValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(1).maxLength(500),
  })
)

// ==========================================
// Gamification Event Validators
// ==========================================
export const createGamificationEventValidator = vine.compile(
  vine.object({
    type: vine.enum(gamificationEventTypes),
    entityType: vine.enum(entityTypes),
    entityId: vine.string().trim(),
    studentId: vine.string().trim(),
    metadata: vine.any().optional(), // JSON
  })
)

export const listGamificationEventsValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    type: vine.enum(gamificationEventTypes).optional(),
    status: vine.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED']).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Student Gamification Validators
// ==========================================
export const addPointsValidator = vine.compile(
  vine.object({
    studentGamificationId: vine.string().trim(),
    points: vine.number(), // Can be negative for penalties
    reason: vine.string().trim().minLength(1).maxLength(500),
    type: vine.enum(['EARNED', 'SPENT', 'ADJUSTED', 'PENALTY', 'BONUS', 'REFUND']),
    relatedEntityType: vine.string().trim().optional(),
    relatedEntityId: vine.string().trim().optional(),
  })
)

export const listStudentGamificationsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    studentId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Leaderboard Validators
// ==========================================
export const createLeaderboardValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    type: vine.enum(['POINTS', 'ACHIEVEMENTS', 'STREAK', 'CUSTOM']),
    scope: vine.enum(['SCHOOL', 'CLASS', 'LEVEL', 'GLOBAL']),
    scopeId: vine.string().trim().optional(), // classId, levelId, etc
    period: vine.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL', 'ALL_TIME']),
    isActive: vine.boolean().optional(),
  })
)

export const updateLeaderboardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listLeaderboardsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    type: vine.enum(['POINTS', 'ACHIEVEMENTS', 'STREAK', 'CUSTOM']).optional(),
    scope: vine.enum(['SCHOOL', 'CLASS', 'LEVEL', 'GLOBAL']).optional(),
    period: vine.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL', 'ALL_TIME']).optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const listLeaderboardEntriesValidator = vine.compile(
  vine.object({
    leaderboardId: vine.string().trim(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Analytics and Stats Validators
// ==========================================
export const getGamificationOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
  })
)

export const getPointsRankingValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    classId: vine.string().trim().optional(),
    levelId: vine.string().trim().optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const getStudentStatsValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
  })
)
