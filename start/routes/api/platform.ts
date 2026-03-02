import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Platform Settings
const ShowPlatformSettingsController = () =>
  import('#controllers/platform_settings/show_platform_settings_controller')
const UpdatePlatformSettingsController = () =>
  import('#controllers/platform_settings/update_platform_settings_controller')

// School Usage Metrics
const GetSchoolUsageMetricsController = () =>
  import('#controllers/school_usage_metrics/get_school_usage_metrics_controller')

export function registerPlatformSettingsApiRoutes() {
  router
    .group(() => {
      router.get('/', [ShowPlatformSettingsController]).as('platform_settings.show')
      router.put('/', [UpdatePlatformSettingsController]).as('platform_settings.update')
    })
    .prefix('/platform-settings')
    .use(middleware.auth())
}

export function registerSchoolUsageMetricsApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetSchoolUsageMetricsController]).as('school_usage_metrics.show')
    })
    .prefix('/school-usage-metrics')
    .use(middleware.auth())
}
