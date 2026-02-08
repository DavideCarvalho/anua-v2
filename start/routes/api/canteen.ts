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
    })
    .prefix('/canteens')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenReportApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetCanteenReportController]).as('canteenReports.summary')
    })
    .prefix('/canteen-reports')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMonthlyTransferApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMonthlyTransfersController]).as('canteenMonthlyTransfers.index')
      router.post('/', [CreateCanteenMonthlyTransferController]).as('canteenMonthlyTransfers.store')
      router.get('/:id', [ShowCanteenMonthlyTransferController]).as('canteenMonthlyTransfers.show')
      router
        .post('/:id/status', [UpdateCanteenMonthlyTransferStatusController])
        .as('canteenMonthlyTransfers.updateStatus')
    })
    .prefix('/canteen-monthly-transfers')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenItemsController]).as('canteenItems.index')
      router.post('/', [CreateCanteenItemController]).as('canteenItems.store')
      router.get('/:id', [ShowCanteenItemController]).as('canteenItems.show')
      router.put('/:id', [UpdateCanteenItemController]).as('canteenItems.update')
      router.delete('/:id', [DeleteCanteenItemController]).as('canteenItems.destroy')
      router
        .patch('/:id/toggle-active', [ToggleCanteenItemActiveController])
        .as('canteenItems.toggleActive')
    })
    .prefix('/canteen-items')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMealApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealsController]).as('canteenMeals.index')
      router.post('/', [CreateCanteenMealController]).as('canteenMeals.store')
      router.get('/:id', [ShowCanteenMealController]).as('canteenMeals.show')
      router.put('/:id', [UpdateCanteenMealController]).as('canteenMeals.update')
      router.delete('/:id', [DeleteCanteenMealController]).as('canteenMeals.destroy')
    })
    .prefix('/canteen-meals')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMealReservationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealReservationsController]).as('canteenMealReservations.index')
      router.post('/', [CreateCanteenMealReservationController]).as('canteenMealReservations.store')
      router.get('/:id', [ShowCanteenMealReservationController]).as('canteenMealReservations.show')
      router
        .post('/:id/status', [UpdateCanteenMealReservationStatusController])
        .as('canteenMealReservations.updateStatus')
      router
        .delete('/:id', [DeleteCanteenMealReservationController])
        .as('canteenMealReservations.cancel')
    })
    .prefix('/canteen-meal-reservations')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenPurchaseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenPurchasesController]).as('canteenPurchases.index')
      router.post('/', [CreateCanteenPurchaseController]).as('canteenPurchases.store')
      router.get('/:id', [ShowCanteenPurchaseController]).as('canteenPurchases.show')
      router
        .post('/:id/status', [UpdateCanteenPurchaseStatusController])
        .as('canteenPurchases.updateStatus')
      router.post('/:id/cancel', [CancelCanteenPurchaseController]).as('canteenPurchases.cancel')
    })
    .prefix('/canteen-purchases')
    .use([middleware.auth(), middleware.impersonation()])
}
