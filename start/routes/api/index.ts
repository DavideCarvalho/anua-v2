import { registerAuthApiRoutes } from './auth.js'
import { registerAsaasWebhookApiRoutes } from './asaas.js'
import { registerSchoolApiRoutes } from './schools.js'
import {
  registerUserApiRoutes,
  registerUserSchoolApiRoutes,
  registerUserSchoolGroupApiRoutes,
  registerSchoolSwitcherApiRoutes,
} from './users.js'
import {
  registerStudentApiRoutes,
  registerResponsibleApiRoutes,
  registerResponsibleAddressApiRoutes,
} from './students.js'
import { registerContractApiRoutes, registerContractDocumentApiRoutes } from './contracts.js'
import {
  registerCourseApiRoutes,
  registerLevelApiRoutes,
  registerCourseHasAcademicPeriodApiRoutes,
  registerLevelAssignmentApiRoutes,
  registerClassApiRoutes,
  registerSubjectApiRoutes,
  registerScheduleApiRoutes,
  registerTeacherApiRoutes,
  registerExamApiRoutes,
  registerGradesApiRoutes,
  registerAcademicPeriodApiRoutes,
} from './academics.js'
import { registerAnalyticsApiRoutes } from './analytics.js'
import { registerEventApiRoutes, registerParentalConsentApiRoutes } from './events.js'
import {
  registerOnlineEnrollmentApiRoutes,
  registerEnrollmentManagementApiRoutes,
} from './enrollment.js'
import {
  registerNotificationApiRoutes,
  registerNotificationPreferenceApiRoutes,
} from './notifications.js'
import { registerPostApiRoutes, registerCommentApiRoutes } from './posts.js'
import { registerExtraClassApiRoutes } from './extra_classes.js'
import { registerAttendanceApiRoutes } from './attendance.js'
import { registerAssignmentApiRoutes } from './assignments.js'
import {
  registerStudentPaymentApiRoutes,
  registerAgreementApiRoutes,
  registerInvoiceApiRoutes,
  registerAuditApiRoutes,
  registerStudentBalanceTransactionApiRoutes,
} from './finance.js'
import {
  registerCanteenApiRoutes,
  registerCanteenReportApiRoutes,
  registerCanteenMonthlyTransferApiRoutes,
  registerCanteenItemApiRoutes,
  registerCanteenMealApiRoutes,
  registerCanteenMealReservationApiRoutes,
  registerCanteenPurchaseApiRoutes,
} from './canteen.js'
import {
  registerAchievementApiRoutes,
  registerStoreApiRoutes,
  registerStoreSettlementApiRoutes,
  registerStoreItemApiRoutes,
  registerStoreOrderApiRoutes,
  registerStoreInstallmentRuleApiRoutes,
  registerStoreOwnerApiRoutes,
} from './stores.js'
import { registerMarketplaceApiRoutes } from './marketplace.js'
import {
  registerStudentGamificationApiRoutes,
  registerLeaderboardApiRoutes,
  registerGamificationEventApiRoutes,
} from './gamification.js'
import {
  registerScholarshipApiRoutes,
  registerSchoolPartnerApiRoutes,
  registerSchoolChainApiRoutes,
  registerSchoolGroupApiRoutes,
} from './schools_meta.js'
import { registerPrintRequestApiRoutes } from './print_requests.js'
import {
  registerPlatformSettingsApiRoutes,
  registerSchoolUsageMetricsApiRoutes,
} from './platform.js'
import {
  registerSubscriptionPlanApiRoutes,
  registerSubscriptionApiRoutes,
  registerSubscriptionInvoiceApiRoutes,
} from './subscriptions.js'
import { registerPurchaseRequestApiRoutes } from './purchase_requests.js'
import { registerInsuranceApiRoutes } from './insurance.js'
import {
  registerImpersonationApiRoutes,
  registerAdminOnboardingApiRoutes,
  registerAdminJobsApiRoutes,
  registerAdminStatsApiRoutes,
} from './admin.js'
import { registerDashboardApiRoutes } from './dashboard.js'
import { registerResponsavelApiRoutes as registerResponsavelDashboardApiRoutes } from './responsavel.js'

export function registerApiRoutes() {
  registerAuthApiRoutes()
  registerDashboardApiRoutes()
  registerResponsavelDashboardApiRoutes()
  registerAdminStatsApiRoutes()
  registerAsaasWebhookApiRoutes()
  registerSchoolApiRoutes()
  registerUserApiRoutes()
  registerUserSchoolApiRoutes()
  registerUserSchoolGroupApiRoutes()
  registerSchoolSwitcherApiRoutes()
  registerStudentApiRoutes()
  registerResponsibleApiRoutes()
  registerResponsibleAddressApiRoutes()
  registerContractApiRoutes()
  registerContractDocumentApiRoutes()
  registerCourseApiRoutes()
  registerLevelApiRoutes()
  registerCourseHasAcademicPeriodApiRoutes()
  registerLevelAssignmentApiRoutes()
  registerClassApiRoutes()
  registerSubjectApiRoutes()
  registerScheduleApiRoutes()
  registerTeacherApiRoutes()
  registerExamApiRoutes()
  registerGradesApiRoutes()
  registerAnalyticsApiRoutes()
  registerEventApiRoutes()
  registerParentalConsentApiRoutes()
  registerOnlineEnrollmentApiRoutes()
  registerEnrollmentManagementApiRoutes()
  registerNotificationApiRoutes()
  registerNotificationPreferenceApiRoutes()
  registerPostApiRoutes()
  registerCommentApiRoutes()
  registerExtraClassApiRoutes()
  registerAttendanceApiRoutes()
  registerAssignmentApiRoutes()
  registerStudentPaymentApiRoutes()
  registerAgreementApiRoutes()
  registerInvoiceApiRoutes()
  registerAuditApiRoutes()
  registerStudentBalanceTransactionApiRoutes()
  registerCanteenApiRoutes()
  registerCanteenReportApiRoutes()
  registerCanteenMonthlyTransferApiRoutes()
  registerCanteenItemApiRoutes()
  registerCanteenMealApiRoutes()
  registerCanteenMealReservationApiRoutes()
  registerCanteenPurchaseApiRoutes()
  registerAchievementApiRoutes()
  registerStoreApiRoutes()
  registerStoreSettlementApiRoutes()
  registerStoreItemApiRoutes()
  registerStoreOrderApiRoutes()
  registerStoreInstallmentRuleApiRoutes()
  registerStoreOwnerApiRoutes()
  registerMarketplaceApiRoutes()
  registerStudentGamificationApiRoutes()
  registerLeaderboardApiRoutes()
  registerGamificationEventApiRoutes()
  registerScholarshipApiRoutes()
  registerSchoolPartnerApiRoutes()
  registerSchoolChainApiRoutes()
  registerSchoolGroupApiRoutes()
  registerAcademicPeriodApiRoutes()
  registerPrintRequestApiRoutes()
  registerPlatformSettingsApiRoutes()
  registerSubscriptionPlanApiRoutes()
  registerSubscriptionApiRoutes()
  registerSubscriptionInvoiceApiRoutes()
  registerSchoolUsageMetricsApiRoutes()
  registerPurchaseRequestApiRoutes()
  registerInsuranceApiRoutes()
  registerImpersonationApiRoutes()
  registerAdminOnboardingApiRoutes()
  registerAdminJobsApiRoutes()
}
