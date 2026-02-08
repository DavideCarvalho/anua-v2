import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Insurance
const GetInsuranceConfigController = () =>
  import('#controllers/insurance/get_insurance_config_controller')
const UpdateSchoolInsuranceController = () =>
  import('#controllers/insurance/update_school_insurance_controller')
const UpdateSchoolChainInsuranceController = () =>
  import('#controllers/insurance/update_school_chain_insurance_controller')
const ResetSchoolInsuranceController = () =>
  import('#controllers/insurance/reset_school_insurance_controller')
const ListInsuranceClaimsController = () =>
  import('#controllers/insurance/list_insurance_claims_controller')
const ApproveInsuranceClaimController = () =>
  import('#controllers/insurance/approve_insurance_claim_controller')
const RejectInsuranceClaimController = () =>
  import('#controllers/insurance/reject_insurance_claim_controller')
const MarkClaimPaidController = () => import('#controllers/insurance/mark_claim_paid_controller')
const ListInsuranceBillingsController = () =>
  import('#controllers/insurance/list_insurance_billings_controller')
const GetBillingDetailsController = () =>
  import('#controllers/insurance/get_billing_details_controller')
const GetInsuranceStatsController = () =>
  import('#controllers/insurance/get_insurance_stats_controller')
const GetDefaultRateBySchoolController = () =>
  import('#controllers/insurance/get_default_rate_by_school_controller')
const GetSchoolsWithoutInsuranceController = () =>
  import('#controllers/insurance/get_schools_without_insurance_controller')
const GetSchoolInsuranceStatsController = () =>
  import('#controllers/insurance/get_school_insurance_stats_controller')
const GetSchoolInsuranceBillingsController = () =>
  import('#controllers/insurance/get_school_insurance_billings_controller')
const GetSchoolInsuranceClaimsController = () =>
  import('#controllers/insurance/get_school_insurance_claims_controller')

export function registerInsuranceApiRoutes() {
  router
    .group(() => {
      // Configuration
      router.get('/config', [GetInsuranceConfigController]).as('insurance.config')
      router
        .put('/school/:schoolId', [UpdateSchoolInsuranceController])
        .as('insurance.updateSchool')
      router
        .put('/chain/:chainId', [UpdateSchoolChainInsuranceController])
        .as('insurance.updateChain')
      router
        .post('/school/:schoolId/reset', [ResetSchoolInsuranceController])
        .as('insurance.resetSchool')

      // Claims
      router.get('/claims', [ListInsuranceClaimsController]).as('insurance.claims.index')
      router
        .post('/claims/:claimId/approve', [ApproveInsuranceClaimController])
        .as('insurance.claims.approve')
      router
        .post('/claims/:claimId/reject', [RejectInsuranceClaimController])
        .as('insurance.claims.reject')
      router
        .post('/claims/:claimId/mark-paid', [MarkClaimPaidController])
        .as('insurance.claims.markPaid')

      // Billings
      router.get('/billings', [ListInsuranceBillingsController]).as('insurance.billings.index')
      router
        .get('/billings/:billingId', [GetBillingDetailsController])
        .as('insurance.billings.show')

      // Analytics
      router.get('/stats', [GetInsuranceStatsController]).as('insurance.stats')
      router
        .get('/analytics/default-rate', [GetDefaultRateBySchoolController])
        .as('insurance.analytics.defaultRate')
      router
        .get('/analytics/schools-without', [GetSchoolsWithoutInsuranceController])
        .as('insurance.analytics.schoolsWithout')

      // School-specific
      router
        .get('/school/:schoolId/stats', [GetSchoolInsuranceStatsController])
        .as('insurance.school.stats')
      router
        .get('/school/:schoolId/billings', [GetSchoolInsuranceBillingsController])
        .as('insurance.school.billings')
      router
        .get('/school/:schoolId/claims', [GetSchoolInsuranceClaimsController])
        .as('insurance.school.claims')
    })
    .prefix('/insurance')
    .use(middleware.auth())
}
