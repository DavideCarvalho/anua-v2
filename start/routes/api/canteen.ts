import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerCanteenApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.canteens.ListCanteens]).as('canteens.index')
      router.post('/', [controllers.canteens.CreateCanteen]).as('canteens.store')
      router
        .get('/meal-recurrences-by-schools', [controllers.canteens.ListMealRecurrencesBySchools])
        .as('canteens.meal_recurrences_by_schools')
      router
        .post('/generate-recurrence-reservations', [
          controllers.canteens.GenerateRecurrenceReservations,
        ])
        .as('canteens.generate_recurrence_reservations')
      router.get('/:id', [controllers.canteens.ShowCanteen]).as('canteens.show')
      router.put('/:id', [controllers.canteens.UpdateCanteen]).as('canteens.update')
      router.delete('/:id', [controllers.canteens.DeleteCanteen]).as('canteens.destroy')
      router
        .get('/:canteenId/items', [controllers.canteenItems.ListItemsByCanteen])
        .as('canteens.items')
      router
        .get('/:canteenId/financial-settings', [
          controllers.canteenFinancialSettings.ShowCanteenFinancialSettings,
        ])
        .as('canteens.financial_settings.show')
      router
        .get('/:canteenId/meal-recurrences', [controllers.canteens.ListCanteenMealRecurrences])
        .as('canteens.meal_recurrences')
      router
        .put('/:canteenId/financial-settings', [
          controllers.canteenFinancialSettings.UpdateCanteenFinancialSettings,
        ])
        .as('canteens.financial_settings.update')
    })
    .prefix('/canteens')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenReportApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.canteenReports.GetCanteenReport]).as('canteen_reports.summary')
    })
    .prefix('/canteen-reports')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMonthlyTransferApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.canteenMonthlyTransfers.ListCanteenMonthlyTransfers])
        .as('canteen_monthly_transfers.index')
      router
        .post('/', [controllers.canteenMonthlyTransfers.CreateCanteenMonthlyTransfer])
        .as('canteen_monthly_transfers.store')
      router
        .get('/:id', [controllers.canteenMonthlyTransfers.ShowCanteenMonthlyTransfer])
        .as('canteen_monthly_transfers.show')
      router
        .post('/:id/status', [
          controllers.canteenMonthlyTransfers.UpdateCanteenMonthlyTransferStatus,
        ])
        .as('canteen_monthly_transfers.update_status')
    })
    .prefix('/canteen-monthly-transfers')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.canteenItems.ListCanteenItems]).as('canteen_items.index')
      router.post('/', [controllers.canteenItems.CreateCanteenItem]).as('canteen_items.store')
      router
        .get('/categories', [controllers.canteenItems.ListCanteenItemCategories])
        .as('canteen_items.categories')
      router.get('/:id', [controllers.canteenItems.ShowCanteenItem]).as('canteen_items.show')
      router.put('/:id', [controllers.canteenItems.UpdateCanteenItem]).as('canteen_items.update')
      router
        .delete('/:id', [controllers.canteenItems.DeleteCanteenItem])
        .as('canteen_items.destroy')
      router
        .patch('/:id/toggle-active', [controllers.canteenItems.ToggleCanteenItemActive])
        .as('canteen_items.toggle_active')
    })
    .prefix('/canteen-items')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMealApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.canteenMeals.ListCanteenMeals]).as('canteen_meals.index')
      router.post('/', [controllers.canteenMeals.CreateCanteenMeal]).as('canteen_meals.store')
      router.get('/:id', [controllers.canteenMeals.ShowCanteenMeal]).as('canteen_meals.show')
      router.put('/:id', [controllers.canteenMeals.UpdateCanteenMeal]).as('canteen_meals.update')
      router
        .delete('/:id', [controllers.canteenMeals.DeleteCanteenMeal])
        .as('canteen_meals.destroy')
    })
    .prefix('/canteen-meals')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenMealReservationApiRoutes() {
  router
    .group(() => {
      router
        .get('/counts', [controllers.canteenMealReservations.GetMealReservationCounts])
        .as('canteen_meal_reservations.counts')
      router
        .get('/', [controllers.canteenMealReservations.ListCanteenMealReservations])
        .as('canteen_meal_reservations.index')
      router
        .post('/', [controllers.canteenMealReservations.CreateCanteenMealReservation])
        .as('canteen_meal_reservations.store')
      router
        .get('/:id', [controllers.canteenMealReservations.ShowCanteenMealReservation])
        .as('canteen_meal_reservations.show')
      router
        .post('/:id/status', [
          controllers.canteenMealReservations.UpdateCanteenMealReservationStatus,
        ])
        .as('canteen_meal_reservations.update_status')
      router
        .delete('/:id', [controllers.canteenMealReservations.DeleteCanteenMealReservation])
        .as('canteen_meal_reservations.cancel')
    })
    .prefix('/canteen-meal-reservations')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCanteenPurchaseApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.canteenPurchases.ListCanteenPurchases])
        .as('canteen_purchases.index')
      router
        .post('/', [controllers.canteenPurchases.CreateCanteenPurchase])
        .as('canteen_purchases.store')
      router
        .get('/:id', [controllers.canteenPurchases.ShowCanteenPurchase])
        .as('canteen_purchases.show')
      router
        .post('/:id/status', [controllers.canteenPurchases.UpdateCanteenPurchaseStatus])
        .as('canteen_purchases.update_status')
      router
        .post('/:id/cancel', [controllers.canteenPurchases.CancelCanteenPurchase])
        .as('canteen_purchases.cancel')
    })
    .prefix('/canteen-purchases')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerStudentMealRecurrenceCheckApiRoutes() {
  router
    .get('/students/:studentId/meal-recurrence-check', [controllers.students.CheckMealRecurrence])
    .use([middleware.auth(), middleware.impersonation()])
}
