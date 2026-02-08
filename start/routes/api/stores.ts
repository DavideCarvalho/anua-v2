import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Achievements
const ListAchievementsController = () =>
  import('#controllers/achievements/list_achievements_controller')
const ShowAchievementController = () =>
  import('#controllers/achievements/show_achievement_controller')
const CreateAchievementController = () =>
  import('#controllers/achievements/create_achievement_controller')
const UpdateAchievementController = () =>
  import('#controllers/achievements/update_achievement_controller')
const DeleteAchievementController = () =>
  import('#controllers/achievements/delete_achievement_controller')
const UnlockAchievementController = () =>
  import('#controllers/achievements/unlock_achievement_controller')

// Stores
const ListStoresController = () => import('#controllers/stores/list_stores_controller')
const ShowStoreController = () => import('#controllers/stores/show_store_controller')
const CreateStoreController = () => import('#controllers/stores/create_store_controller')
const UpdateStoreController = () => import('#controllers/stores/update_store_controller')
const DeleteStoreController = () => import('#controllers/stores/delete_store_controller')

// Store Financial Settings
const ShowStoreFinancialSettingsController = () =>
  import('#controllers/store_financial_settings/show_store_financial_settings_controller')
const UpsertStoreFinancialSettingsController = () =>
  import('#controllers/store_financial_settings/upsert_store_financial_settings_controller')

// Store Settlements
const ListStoreSettlementsController = () =>
  import('#controllers/store_settlements/list_store_settlements_controller')
const ShowStoreSettlementController = () =>
  import('#controllers/store_settlements/show_store_settlement_controller')
const CreateStoreSettlementController = () =>
  import('#controllers/store_settlements/create_store_settlement_controller')
const UpdateStoreSettlementStatusController = () =>
  import('#controllers/store_settlements/update_store_settlement_status_controller')

// Store Items
const ListStoreItemsController = () =>
  import('#controllers/store_items/list_store_items_controller')
const ShowStoreItemController = () => import('#controllers/store_items/show_store_item_controller')
const CreateStoreItemController = () =>
  import('#controllers/store_items/create_store_item_controller')
const UpdateStoreItemController = () =>
  import('#controllers/store_items/update_store_item_controller')
const DeleteStoreItemController = () =>
  import('#controllers/store_items/delete_store_item_controller')
const ToggleStoreItemActiveController = () =>
  import('#controllers/store_items/toggle_store_item_active_controller')

// Store Orders
const ListStoreOrdersController = () =>
  import('#controllers/store_orders/list_store_orders_controller')
const ShowStoreOrderController = () =>
  import('#controllers/store_orders/show_store_order_controller')
const CreateStoreOrderController = () =>
  import('#controllers/store_orders/create_store_order_controller')
const ApproveStoreOrderController = () =>
  import('#controllers/store_orders/approve_store_order_controller')
const RejectStoreOrderController = () =>
  import('#controllers/store_orders/reject_store_order_controller')
const DeliverStoreOrderController = () =>
  import('#controllers/store_orders/deliver_store_order_controller')
const CancelStoreOrderController = () =>
  import('#controllers/store_orders/cancel_store_order_controller')

// Store Installment Rules
const ListStoreInstallmentRulesController = () =>
  import('#controllers/store_installment_rules/list_store_installment_rules_controller')
const CreateStoreInstallmentRuleController = () =>
  import('#controllers/store_installment_rules/create_store_installment_rule_controller')
const UpdateStoreInstallmentRuleController = () =>
  import('#controllers/store_installment_rules/update_store_installment_rule_controller')
const DeleteStoreInstallmentRuleController = () =>
  import('#controllers/store_installment_rules/delete_store_installment_rule_controller')

// Store Owner Controllers
const ShowOwnStoreController = () => import('#controllers/store_owner/show_own_store_controller')
const ListOwnProductsController = () =>
  import('#controllers/store_owner/list_own_products_controller')
const SOCreateProductController = () => import('#controllers/store_owner/create_product_controller')
const SOUpdateProductController = () => import('#controllers/store_owner/update_product_controller')
const SODeleteProductController = () => import('#controllers/store_owner/delete_product_controller')
const SOToggleProductActiveController = () =>
  import('#controllers/store_owner/toggle_product_active_controller')
const ListOwnOrdersController = () => import('#controllers/store_owner/list_own_orders_controller')
const SOShowOrderController = () => import('#controllers/store_owner/show_order_controller')
const SOApproveOrderController = () => import('#controllers/store_owner/approve_order_controller')
const SORejectOrderController = () => import('#controllers/store_owner/reject_order_controller')
const SOMarkPreparingController = () => import('#controllers/store_owner/mark_preparing_controller')
const SOMarkReadyController = () => import('#controllers/store_owner/mark_ready_controller')
const SODeliverOrderController = () => import('#controllers/store_owner/deliver_order_controller')
const SOShowFinancialSettingsController = () =>
  import('#controllers/store_owner/show_financial_settings_controller')
const SOUpdateFinancialSettingsController = () =>
  import('#controllers/store_owner/update_financial_settings_controller')
const SOListSettlementsController = () =>
  import('#controllers/store_owner/list_settlements_controller')

export function registerAchievementApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAchievementsController]).as('achievements.index')
      router.post('/', [CreateAchievementController]).as('achievements.store')
      router.get('/:id', [ShowAchievementController]).as('achievements.show')
      router.put('/:id', [UpdateAchievementController]).as('achievements.update')
      router.delete('/:id', [DeleteAchievementController]).as('achievements.destroy')
      router.post('/:id/unlock', [UnlockAchievementController]).as('achievements.unlock')
    })
    .prefix('/achievements')
    .use(middleware.auth())
}

export function registerStoreApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoresController]).as('stores.index')
      router.post('/', [CreateStoreController]).as('stores.store')
      router.get('/:id', [ShowStoreController]).as('stores.show')
      router.put('/:id', [UpdateStoreController]).as('stores.update')
      router.delete('/:id', [DeleteStoreController]).as('stores.destroy')
      router
        .get('/:storeId/financial-settings', [ShowStoreFinancialSettingsController])
        .as('stores.financialSettings.show')
      router
        .put('/:storeId/financial-settings', [UpsertStoreFinancialSettingsController])
        .as('stores.financialSettings.upsert')
    })
    .prefix('/stores')
    .use(middleware.auth())
}

export function registerStoreSettlementApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreSettlementsController]).as('storeSettlements.index')
      router.post('/', [CreateStoreSettlementController]).as('storeSettlements.store')
      router.get('/:id', [ShowStoreSettlementController]).as('storeSettlements.show')
      router
        .put('/:id/status', [UpdateStoreSettlementStatusController])
        .as('storeSettlements.updateStatus')
    })
    .prefix('/store-settlements')
    .use(middleware.auth())
}

export function registerStoreItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreItemsController]).as('storeItems.index')
      router.post('/', [CreateStoreItemController]).as('storeItems.store')
      router.get('/:id', [ShowStoreItemController]).as('storeItems.show')
      router.put('/:id', [UpdateStoreItemController]).as('storeItems.update')
      router.delete('/:id', [DeleteStoreItemController]).as('storeItems.destroy')
      router
        .patch('/:id/toggle-active', [ToggleStoreItemActiveController])
        .as('storeItems.toggleActive')
    })
    .prefix('/store-items')
    .use(middleware.auth())
}

export function registerStoreOrderApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreOrdersController]).as('storeOrders.index')
      router.post('/', [CreateStoreOrderController]).as('storeOrders.store')
      router.get('/:id', [ShowStoreOrderController]).as('storeOrders.show')
      router.post('/:id/approve', [ApproveStoreOrderController]).as('storeOrders.approve')
      router.post('/:id/reject', [RejectStoreOrderController]).as('storeOrders.reject')
      router.post('/:id/deliver', [DeliverStoreOrderController]).as('storeOrders.deliver')
      router.post('/:id/cancel', [CancelStoreOrderController]).as('storeOrders.cancel')
    })
    .prefix('/store-orders')
    .use(middleware.auth())
}

export function registerStoreInstallmentRuleApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreInstallmentRulesController]).as('storeInstallmentRules.index')
      router.post('/', [CreateStoreInstallmentRuleController]).as('storeInstallmentRules.store')
      router.put('/:id', [UpdateStoreInstallmentRuleController]).as('storeInstallmentRules.update')
      router
        .delete('/:id', [DeleteStoreInstallmentRuleController])
        .as('storeInstallmentRules.destroy')
    })
    .prefix('/store-installment-rules')
    .use(middleware.auth())
}

export function registerStoreOwnerApiRoutes() {
  router
    .group(() => {
      // Store info
      router.get('/store', [ShowOwnStoreController]).as('storeOwner.store.show')

      // Products
      router.get('/products', [ListOwnProductsController]).as('storeOwner.products.index')
      router.post('/products', [SOCreateProductController]).as('storeOwner.products.store')
      router.put('/products/:id', [SOUpdateProductController]).as('storeOwner.products.update')
      router.delete('/products/:id', [SODeleteProductController]).as('storeOwner.products.destroy')
      router
        .patch('/products/:id/toggle-active', [SOToggleProductActiveController])
        .as('storeOwner.products.toggleActive')

      // Orders
      router.get('/orders', [ListOwnOrdersController]).as('storeOwner.orders.index')
      router.get('/orders/:id', [SOShowOrderController]).as('storeOwner.orders.show')
      router.post('/orders/:id/approve', [SOApproveOrderController]).as('storeOwner.orders.approve')
      router.post('/orders/:id/reject', [SORejectOrderController]).as('storeOwner.orders.reject')
      router
        .post('/orders/:id/preparing', [SOMarkPreparingController])
        .as('storeOwner.orders.preparing')
      router.post('/orders/:id/ready', [SOMarkReadyController]).as('storeOwner.orders.ready')
      router.post('/orders/:id/deliver', [SODeliverOrderController]).as('storeOwner.orders.deliver')

      // Financial
      router
        .get('/financial-settings', [SOShowFinancialSettingsController])
        .as('storeOwner.financial.show')
      router
        .put('/financial-settings', [SOUpdateFinancialSettingsController])
        .as('storeOwner.financial.update')
      router.get('/settlements', [SOListSettlementsController]).as('storeOwner.settlements.index')
    })
    .prefix('/store-owner')
    .use([middleware.auth(), middleware.storeOwner()])
}
