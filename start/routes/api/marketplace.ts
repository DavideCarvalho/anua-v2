import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerMarketplaceApiRoutes() {
  router
    .group(() => {
      router
        .get('/stores', [controllers.marketplace.ListMarketplaceStores])
        .as('marketplace.stores.index')
      router
        .get('/stores/:storeId/items', [controllers.marketplace.ListStoreItems])
        .as('marketplace.stores.items')
      router
        .get('/stores/:storeId/context', [controllers.marketplace.GetMarketplaceStoreContext])
        .as('marketplace.stores.context')
      router
        .get('/installment-options', [controllers.marketplace.GetInstallmentOptions])
        .as('marketplace.installment_options')
      router
        .post('/checkout', [controllers.marketplace.MarketplaceCheckout])
        .as('marketplace.checkout')
      router.get('/orders', [controllers.marketplace.ListMyOrders]).as('marketplace.orders.index')
      router.get('/orders/:id', [controllers.marketplace.ShowMyOrder]).as('marketplace.orders.show')
    })
    .prefix('/marketplace')
    .use([middleware.auth(), middleware.impersonation()])
}
