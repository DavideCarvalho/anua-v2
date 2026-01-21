import vine from '@vinejs/vine'

// Attendance analytics
export const getAttendanceOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)

export const getAttendanceTrendsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    period: vine.enum(['week', 'month', 'quarter', 'year'] as const).optional(),
  })
)

export const getChronicAbsenteeismValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    threshold: vine.number().min(0).max(100).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// Canteen analytics
export const getCanteenOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)

export const getCanteenTrendsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    period: vine.enum(['week', 'month', 'quarter', 'year'] as const).optional(),
  })
)

export const getCanteenTopItemsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    limit: vine.number().min(1).max(50).optional(),
  })
)

// Payments analytics
export const getPaymentsOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)

// Enrollments analytics
export const getEnrollmentsOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    academicPeriodId: vine.string().uuid().optional(),
  })
)

export const getFunnelStatsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    academicPeriodId: vine.string().uuid().optional(),
  })
)

export const getTrendsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    academicPeriodId: vine.string().optional(),
    days: vine.number().optional(),
  })
)

export const getByLevelValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    academicPeriodId: vine.string().uuid().optional(),
  })
)

// Incidents analytics
export const getIncidentsOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)

// Gamification analytics
export const getGamificationOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
  })
)

// HR analytics
export const getHrOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
  })
)
