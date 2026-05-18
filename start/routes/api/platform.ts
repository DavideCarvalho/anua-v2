import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerPlatformSettingsApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.platformSettings.ShowPlatformSettings])
        .as('platform_settings.show')
      router
        .put('/', [controllers.platformSettings.UpdatePlatformSettings])
        .as('platform_settings.update')
    })
    .prefix('/platform-settings')
    .use(middleware.auth())
}

export function registerSchoolUsageMetricsApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.schoolUsageMetrics.GetSchoolUsageMetrics])
        .as('school_usage_metrics.show')
    })
    .prefix('/school-usage-metrics')
    .use(middleware.auth())
}
