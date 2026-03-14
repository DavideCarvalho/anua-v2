import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Canteens
const ListCanteensController = () => import('#controllers/canteens/list_canteens_controller')
const ShowCanteenController = () => import('#controllers/canteens/show_canteen_controller')
const CreateCanteenController = () => import('#controllers/canteens/create_canteen_controller')
const UpdateCanteenController = () => import('#controllers/canteens/update_canteen_controller')
const DeleteCanteenController = () => import('#controllers/canteens/delete_canteen_controller')

// Canteen Items
const ListCanteenItemsController = () =>
  import('#controllers/canteen_items/list_canteen_items_controller')
const ShowCanteenItemController = () =>
  import('#controllers/canteen_items/show_canteen_item_controller')
const CreateCanteenItemController = () =>
  import('#controllers/canteen_items/create_canteen_item_controller')
const UpdateCanteenItemController = () =>
  import('#controllers/canteen_items/update_canteen_item_controller')
const DeleteCanteenItemController = () =>
  import('#controllers/canteen_items/delete_canteen_item_controller')
const ListItemsByCanteenController = () =>
  import('#controllers/canteen_items/list_items_by_canteen_controller')
const ToggleCanteenItemActiveController = () =>
  import('#controllers/canteen_items/toggle_canteen_item_active_controller')
const ListCanteenItemCategoriesController = () =>
  import('#controllers/canteen_items/list_canteen_item_categories_controller')

// Canteen Reports
const GetCanteenReportController = () =>
  import('#controllers/canteen_reports/get_canteen_report_controller')

// Canteen Monthly Transfers
const ListCanteenMonthlyTransfersController = () =>
  import('#controllers/canteen_monthly_transfers/list_canteen_monthly_transfers_controller')
const ShowCanteenMonthlyTransferController = () =>
  import('#controllers/canteen_monthly_transfers/show_canteen_monthly_transfer_controller')
const CreateCanteenMonthlyTransferController = () =>
  import('#controllers/canteen_monthly_transfers/create_canteen_monthly_transfer_controller')
const UpdateCanteenMonthlyTransferStatusController = () =>
  import('#controllers/canteen_monthly_transfers/update_canteen_monthly_transfer_status_controller')

// Canteen Meals
const ListCanteenMealsController = () =>
  import('#controllers/canteen_meals/list_canteen_meals_controller')
const ShowCanteenMealController = () =>
  import('#controllers/canteen_meals/show_canteen_meal_controller')
const CreateCanteenMealController = () =>
  import('#controllers/canteen_meals/create_canteen_meal_controller')
const UpdateCanteenMealController = () =>
  import('#controllers/canteen_meals/update_canteen_meal_controller')
const DeleteCanteenMealController = () =>
  import('#controllers/canteen_meals/delete_canteen_meal_controller')

// Canteen Meal Reservations
const ListCanteenMealReservationsController = () =>
  import('#controllers/canteen_meal_reservations/list_canteen_meal_reservations_controller')
const ShowCanteenMealReservationController = () =>
  import('#controllers/canteen_meal_reservations/show_canteen_meal_reservation_controller')
const CreateCanteenMealReservationController = () =>
  import('#controllers/canteen_meal_reservations/create_canteen_meal_reservation_controller')
const UpdateCanteenMealReservationStatusController = () =>
  import('#controllers/canteen_meal_reservations/update_canteen_meal_reservation_status_controller')
const DeleteCanteenMealReservationController = () =>
  import('#controllers/canteen_meal_reservations/delete_canteen_meal_reservation_controller')

// Canteen Financial Settings
const ShowCanteenFinancialSettingsController = () =>
  import('#controllers/canteen_financial_settings/show_canteen_financial_settings_controller')

// Canteen Purchases
const ListCanteenPurchasesController = () =>
  import('#controllers/canteen_purchases/list_canteen_purchases_controller')
const ShowCanteenPurchaseController = () =>
  import('#controllers/canteen_purchases/show_canteen_purchase_controller')
const CreateCanteenPurchaseController = () =>
  import('#controllers/canteen_purchases/create_canteen_purchase_controller')
const UpdateCanteenPurchaseStatusController = () =>
  import('#controllers/canteen_purchases/update_canteen_purchase_status_controller')
const CancelCanteenPurchaseController = () =>
  import('#controllers/canteen_purchases/cancel_canteen_purchase_controller')

export function registerCanteenApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteensController]).as('canteens.index')
      router.post('/', [CreateCanteenController]).as('canteens.store')
      router.get('/:id', [ShowCanteenController]).as('canteens.show')
      router.put('/:id', [UpdateCanteenController]).as('canteens.update')
      router.delete('/:id', [DeleteCanteenController]).as('canteens.destroy')
      router.get('/:canteenId/items', [ListItemsByCanteenController]).as('canteens.items')
      router
        .get('/:canteenId/financial-settings', [ShowCanteenFinancialSettingsController])
        .as('canteens.financial_settings.show')
    })
    .prefix('/canteens')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenReportApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetCanteenReportController]).as('canteen_reports.summary')
    })
    .prefix('/canteen-reports')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMonthlyTransferApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMonthlyTransfersController]).as('canteen_monthly_transfers.index')
      router
        .post('/', [CreateCanteenMonthlyTransferController])
        .as('canteen_monthly_transfers.store')
      router
        .get('/:id', [ShowCanteenMonthlyTransferController])
        .as('canteen_monthly_transfers.show')
      router
        .post('/:id/status', [UpdateCanteenMonthlyTransferStatusController])
        .as('canteen_monthly_transfers.update_status')
    })
    .prefix('/canteen-monthly-transfers')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenItemsController]).as('canteen_items.index')
      router.post('/', [CreateCanteenItemController]).as('canteen_items.store')
      router
        .get('/categories', [ListCanteenItemCategoriesController])
        .as('canteen_items.categories')
      router.get('/:id', [ShowCanteenItemController]).as('canteen_items.show')
      router.put('/:id', [UpdateCanteenItemController]).as('canteen_items.update')
      router.delete('/:id', [DeleteCanteenItemController]).as('canteen_items.destroy')
      router
        .patch('/:id/toggle-active', [ToggleCanteenItemActiveController])
        .as('canteen_items.toggle_active')
    })
    .prefix('/canteen-items')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMealApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealsController]).as('canteen_meals.index')
      router.post('/', [CreateCanteenMealController]).as('canteen_meals.store')
      router.get('/:id', [ShowCanteenMealController]).as('canteen_meals.show')
      router.put('/:id', [UpdateCanteenMealController]).as('canteen_meals.update')
      router.delete('/:id', [DeleteCanteenMealController]).as('canteen_meals.destroy')
    })
    .prefix('/canteen-meals')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMealReservationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealReservationsController]).as('canteen_meal_reservations.index')
      router
        .post('/', [CreateCanteenMealReservationController])
        .as('canteen_meal_reservations.store')
      router
        .get('/:id', [ShowCanteenMealReservationController])
        .as('canteen_meal_reservations.show')
      router
        .post('/:id/status', [UpdateCanteenMealReservationStatusController])
        .as('canteen_meal_reservations.update_status')
      router
        .delete('/:id', [DeleteCanteenMealReservationController])
        .as('canteen_meal_reservations.cancel')
    })
    .prefix('/canteen-meal-reservations')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenPurchaseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenPurchasesController]).as('canteen_purchases.index')
      router.post('/', [CreateCanteenPurchaseController]).as('canteen_purchases.store')
      router.get('/:id', [ShowCanteenPurchaseController]).as('canteen_purchases.show')
      router
        .post('/:id/status', [UpdateCanteenPurchaseStatusController])
        .as('canteen_purchases.update_status')
      router.post('/:id/cancel', [CancelCanteenPurchaseController]).as('canteen_purchases.cancel')
    })
    .prefix('/canteen-purchases')
    .use([middleware.auth(), middleware.impersonation()])
}
