import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAchievementApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.achievements.ListAchievements]).as('achievements.index')
      router.post('/', [controllers.achievements.CreateAchievement]).as('achievements.store')
      router.get('/:id', [controllers.achievements.ShowAchievement]).as('achievements.show')
      router.put('/:id', [controllers.achievements.UpdateAchievement]).as('achievements.update')
      router.delete('/:id', [controllers.achievements.DeleteAchievement]).as('achievements.destroy')
      router
        .post('/:id/unlock', [controllers.achievements.UnlockAchievement])
        .as('achievements.unlock')
      router
        .put('/:achievementId/schools/:schoolId/config', [
          controllers.achievements.UpdateSchoolAchievementConfig,
        ])
        .as('achievements.config.update')
    })
    .prefix('/achievements')
    .use(middleware.auth())
}

export function registerStoreApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.stores.ListStores]).as('stores.index')
      router.post('/', [controllers.stores.CreateStore]).as('stores.store')
      router.get('/:id', [controllers.stores.ShowStore]).as('stores.show')
      router.put('/:id', [controllers.stores.UpdateStore]).as('stores.update')
      router.delete('/:id', [controllers.stores.DeleteStore]).as('stores.destroy')
      router
        .get('/:storeId/financial-settings', [
          controllers.storeFinancialSettings.ShowStoreFinancialSettings,
        ])
        .as('stores.financial_settings.show')
      router
        .put('/:storeId/financial-settings', [
          controllers.storeFinancialSettings.UpsertStoreFinancialSettings,
        ])
        .as('stores.financial_settings.upsert')
    })
    .prefix('/stores')
    .use(middleware.auth())
}

export function registerStoreSettlementApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.storeSettlements.ListStoreSettlements])
        .as('store_settlements.index')
      router
        .post('/', [controllers.storeSettlements.CreateStoreSettlement])
        .as('store_settlements.store')
      router
        .get('/:id', [controllers.storeSettlements.ShowStoreSettlement])
        .as('store_settlements.show')
      router
        .patch('/:id/update-status', [controllers.storeSettlements.UpdateStoreSettlementStatus])
        .as('store_settlements.update_status')
    })
    .prefix('/store-settlements')
    .use(middleware.auth())
}

export function registerStoreItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.storeItems.ListStoreItems]).as('store_items.index')
      router.post('/', [controllers.storeItems.CreateStoreItem]).as('store_items.store')
      router.get('/:id', [controllers.storeItems.ShowStoreItem]).as('store_items.show')
      router.put('/:id', [controllers.storeItems.UpdateStoreItem]).as('store_items.update')
      router.delete('/:id', [controllers.storeItems.DeleteStoreItem]).as('store_items.destroy')
      router
        .patch('/:id/toggle-active', [controllers.storeItems.ToggleStoreItemActive])
        .as('store_items.toggle_active')
    })
    .prefix('/store-items')
    .use(middleware.auth())
}

export function registerStoreOrderApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.storeOrders.ListStoreOrders]).as('store_orders.index')
      router.post('/', [controllers.storeOrders.CreateStoreOrder]).as('store_orders.store')
      router.get('/:id', [controllers.storeOrders.ShowStoreOrder]).as('store_orders.show')
      router
        .post('/:id/approve', [controllers.storeOrders.ApproveStoreOrder])
        .as('store_orders.approve')
      router
        .post('/:id/reject', [controllers.storeOrders.RejectStoreOrder])
        .as('store_orders.reject')
      router
        .post('/:id/deliver', [controllers.storeOrders.DeliverStoreOrder])
        .as('store_orders.deliver')
      router
        .post('/:id/cancel', [controllers.storeOrders.CancelStoreOrder])
        .as('store_orders.cancel')
    })
    .prefix('/store-orders')
    .use(middleware.auth())
}

export function registerStoreInstallmentRuleApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.storeInstallmentRules.ListStoreInstallmentRules])
        .as('store_installment_rules.index')
      router
        .post('/', [controllers.storeInstallmentRules.CreateStoreInstallmentRule])
        .as('store_installment_rules.store')
      router
        .put('/:id', [controllers.storeInstallmentRules.UpdateStoreInstallmentRule])
        .as('store_installment_rules.update')
      router
        .delete('/:id', [controllers.storeInstallmentRules.DeleteStoreInstallmentRule])
        .as('store_installment_rules.destroy')
    })
    .prefix('/store-installment-rules')
    .use(middleware.auth())
}

export function registerStoreOwnerApiRoutes() {
  router
    .group(() => {
      // Store info
      router.get('/store', [controllers.storeOwner.ShowOwnStore]).as('store_owner.store.show')

      // Products
      router
        .get('/products', [controllers.storeOwner.ListOwnProducts])
        .as('store_owner.products.index')
      router
        .post('/products', [controllers.storeOwner.CreateProduct])
        .as('store_owner.products.store')
      router
        .put('/products/:id', [controllers.storeOwner.UpdateProduct])
        .as('store_owner.products.update')
      router
        .delete('/products/:id', [controllers.storeOwner.DeleteProduct])
        .as('store_owner.products.destroy')
      router
        .patch('/products/:id/toggle-active', [controllers.storeOwner.ToggleProductActive])
        .as('store_owner.products.toggle_active')

      // Orders
      router.get('/orders', [controllers.storeOwner.ListOwnOrders]).as('store_owner.orders.index')
      router.get('/orders/:id', [controllers.storeOwner.ShowOrder]).as('store_owner.orders.show')
      router
        .post('/orders/:id/approve', [controllers.storeOwner.ApproveOrder])
        .as('store_owner.orders.approve')
      router
        .post('/orders/:id/reject', [controllers.storeOwner.RejectOrder])
        .as('store_owner.orders.reject')
      router
        .post('/orders/:id/preparing', [controllers.storeOwner.MarkPreparing])
        .as('store_owner.orders.preparing')
      router
        .post('/orders/:id/ready', [controllers.storeOwner.MarkReady])
        .as('store_owner.orders.ready')
      router
        .post('/orders/:id/deliver', [controllers.storeOwner.DeliverOrder])
        .as('store_owner.orders.deliver')
      router
        .post('/orders/:id/cancel', [controllers.storeOwner.CancelOrder])
        .as('store_owner.orders.cancel')

      // Financial
      router
        .get('/financial-settings', [controllers.storeOwner.ShowFinancialSettings])
        .as('store_owner.financial.show')
      router
        .put('/financial-settings', [controllers.storeOwner.UpdateFinancialSettings])
        .as('store_owner.financial.update')
      router
        .get('/settlements', [controllers.storeOwner.ListSettlements])
        .as('store_owner.settlements.index')
    })
    .prefix('/store-owner')
    .use([middleware.auth(), middleware.storeOwner()])
}
