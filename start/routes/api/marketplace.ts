import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Marketplace Controllers
const ListMarketplaceStoresController = () =>
  import('#controllers/marketplace/list_marketplace_stores_controller')
const MPListStoreItemsController = () =>
  import('#controllers/marketplace/list_store_items_controller')
const GetMarketplaceStoreContextController = () =>
  import('#controllers/marketplace/get_marketplace_store_context_controller')
const GetInstallmentOptionsController = () =>
  import('#controllers/marketplace/get_installment_options_controller')
const MarketplaceCheckoutController = () =>
  import('#controllers/marketplace/marketplace_checkout_controller')
const ListMyOrdersController = () => import('#controllers/marketplace/list_my_orders_controller')
const ShowMyOrderController = () => import('#controllers/marketplace/show_my_order_controller')

export function registerMarketplaceApiRoutes() {
  router
    .group(() => {
      router.get('/stores', [ListMarketplaceStoresController]).as('marketplace.stores.index')
      router
        .get('/stores/:storeId/items', [MPListStoreItemsController])
        .as('marketplace.stores.items')
      router
        .get('/stores/:storeId/context', [GetMarketplaceStoreContextController])
        .as('marketplace.stores.context')
      router
        .get('/installment-options', [GetInstallmentOptionsController])
        .as('marketplace.installment_options')
      router.post('/checkout', [MarketplaceCheckoutController]).as('marketplace.checkout')
      router.get('/orders', [ListMyOrdersController]).as('marketplace.orders.index')
      router.get('/orders/:id', [ShowMyOrderController]).as('marketplace.orders.show')
    })
    .prefix('/marketplace')
    .use([middleware.auth(), middleware.impersonation()])
}
