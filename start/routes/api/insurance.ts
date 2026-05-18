import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerInsuranceApiRoutes() {
  router
    .group(() => {
      // Configuration
      router.get('/config', [controllers.insurance.GetInsuranceConfig]).as('insurance.config')
      router
        .put('/school/:schoolId', [controllers.insurance.UpdateSchoolInsurance])
        .as('insurance.update_school')
      router
        .put('/chain/:chainId', [controllers.insurance.UpdateSchoolChainInsurance])
        .as('insurance.update_chain')
      router
        .post('/school/:schoolId/reset', [controllers.insurance.ResetSchoolInsurance])
        .as('insurance.reset_school')

      // Claims
      router
        .get('/claims', [controllers.insurance.ListInsuranceClaims])
        .as('insurance.claims.index')
      router
        .post('/claims/:claimId/approve', [controllers.insurance.ApproveInsuranceClaim])
        .as('insurance.claims.approve')
      router
        .post('/claims/:claimId/reject', [controllers.insurance.RejectInsuranceClaim])
        .as('insurance.claims.reject')
      router
        .post('/claims/:claimId/mark-paid', [controllers.insurance.MarkClaimPaid])
        .as('insurance.claims.mark_paid')

      // Billings
      router
        .get('/billings', [controllers.insurance.ListInsuranceBillings])
        .as('insurance.billings.index')
      router
        .get('/billings/:billingId', [controllers.insurance.GetBillingDetails])
        .as('insurance.billings.show')

      // Analytics
      router.get('/stats', [controllers.insurance.GetInsuranceStats]).as('insurance.stats')
      router
        .get('/analytics/default-rate', [controllers.insurance.GetDefaultRateBySchool])
        .as('insurance.analytics.default_rate')
      router
        .get('/analytics/schools-without', [controllers.insurance.GetSchoolsWithoutInsurance])
        .as('insurance.analytics.schools_without')

      // School-specific
      router
        .get('/school/:schoolId/stats', [controllers.insurance.GetSchoolInsuranceStats])
        .as('insurance.school.stats')
      router
        .get('/school/:schoolId/billings', [controllers.insurance.GetSchoolInsuranceBillings])
        .as('insurance.school.billings')
      router
        .get('/school/:schoolId/claims', [controllers.insurance.GetSchoolInsuranceClaims])
        .as('insurance.school.claims')
    })
    .prefix('/insurance')
    .use(middleware.auth())
}
