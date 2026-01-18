/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// =============================================================================
// CONTROLLER IMPORTS
// =============================================================================

// Schools
const IndexSchoolsController = () => import('#controllers/schools/index')
const ShowSchoolController = () => import('#controllers/schools/show')
const ShowSchoolBySlugController = () => import('#controllers/schools/show_by_slug')
const StoreSchoolController = () => import('#controllers/schools/store')
const UpdateSchoolController = () => import('#controllers/schools/update')
const DestroySchoolController = () => import('#controllers/schools/destroy')

// Auth
const LoginController = () => import('#controllers/auth/login')
const LogoutController = () => import('#controllers/auth/logout')
const MeController = () => import('#controllers/auth/me')

// Users
const IndexUsersController = () => import('#controllers/users/index')
const ShowUserController = () => import('#controllers/users/show')
const StoreUserController = () => import('#controllers/users/store')
const UpdateUserController = () => import('#controllers/users/update')
const DestroyUserController = () => import('#controllers/users/destroy')

// Students
const IndexStudentsController = () => import('#controllers/students/index')
const ShowStudentController = () => import('#controllers/students/show')
const StoreStudentController = () => import('#controllers/students/store')
const UpdateStudentController = () => import('#controllers/students/update')
const DestroyStudentController = () => import('#controllers/students/destroy')

// Responsibles
const ListStudentResponsiblesController = () =>
  import('#controllers/responsibles/list_student_responsibles_controller')
const AssignResponsibleController = () =>
  import('#controllers/responsibles/assign_responsible_controller')
const UpdateResponsibleAssignmentController = () =>
  import('#controllers/responsibles/update_responsible_assignment_controller')
const RemoveResponsibleController = () =>
  import('#controllers/responsibles/remove_responsible_controller')

// Responsible Addresses
const ShowResponsibleAddressController = () =>
  import('#controllers/responsible-addresses/show_responsible_address_controller')
const CreateResponsibleAddressController = () =>
  import('#controllers/responsible-addresses/create_responsible_address_controller')

// Contracts
const ListContractsController = () => import('#controllers/contracts/list_contracts_controller')
const ShowContractController = () => import('#controllers/contracts/show_contract_controller')
const CreateContractController = () => import('#controllers/contracts/create_contract_controller')
const UpdateContractController = () => import('#controllers/contracts/update_contract_controller')
const DeleteContractController = () => import('#controllers/contracts/delete_contract_controller')
const GetSignatureStatsController = () =>
  import('#controllers/contracts/get_signature_stats_controller')
const GetDocusealTemplateController = () =>
  import('#controllers/contracts/get_docuseal_template_controller')
const UploadDocusealTemplateController = () =>
  import('#controllers/contracts/upload_docuseal_template_controller')
const DeleteDocusealTemplateController = () =>
  import('#controllers/contracts/delete_docuseal_template_controller')

// Contract Documents
const ListContractDocumentsController = () =>
  import('#controllers/contract-documents/list_contract_documents_controller')
const CreateContractDocumentController = () =>
  import('#controllers/contract-documents/create_contract_document_controller')

// Courses
const ListCoursesController = () => import('#controllers/courses/list_courses_controller')
const ShowCourseController = () => import('#controllers/courses/show_course_controller')
const CreateCourseController = () => import('#controllers/courses/create_course_controller')
const UpdateCourseController = () => import('#controllers/courses/update_course_controller')
const DeleteCourseController = () => import('#controllers/courses/delete_course_controller')

// Levels
const ListLevelsController = () => import('#controllers/levels/list_levels_controller')
const ShowLevelController = () => import('#controllers/levels/show_level_controller')
const CreateLevelController = () => import('#controllers/levels/create_level_controller')
const UpdateLevelController = () => import('#controllers/levels/update_level_controller')
const DeleteLevelController = () => import('#controllers/levels/delete_level_controller')

// Classes
const ListClassesController = () => import('#controllers/classes/list_classes_controller')
const ShowClassController = () => import('#controllers/classes/show_class_controller')
const ShowClassBySlugController = () => import('#controllers/classes/show_class_by_slug_controller')
const CreateClassController = () => import('#controllers/classes/create_class_controller')
const UpdateClassController = () => import('#controllers/classes/update_class_controller')
const DeleteClassController = () => import('#controllers/classes/delete_class_controller')
const ListClassStudentsController = () =>
  import('#controllers/classes/list_class_students_controller')
const CountClassStudentsController = () =>
  import('#controllers/classes/count_class_students_controller')

// Subjects
const ListSubjectsController = () => import('#controllers/subjects/list_subjects_controller')
const ShowSubjectController = () => import('#controllers/subjects/show_subject_controller')
const ShowSubjectBySlugController = () =>
  import('#controllers/subjects/show_subject_by_slug_controller')
const CreateSubjectController = () => import('#controllers/subjects/create_subject_controller')
const UpdateSubjectController = () => import('#controllers/subjects/update_subject_controller')
const DeleteSubjectController = () => import('#controllers/subjects/delete_subject_controller')
const ListSubjectsForClassController = () =>
  import('#controllers/subjects/list_subjects_for_class_controller')

// Teachers
const ListTeachersController = () => import('#controllers/teachers/list_teachers_controller')
const ShowTeacherController = () => import('#controllers/teachers/show_teacher_controller')
const CreateTeacherController = () => import('#controllers/teachers/create_teacher_controller')
const UpdateTeacherController = () => import('#controllers/teachers/update_teacher_controller')
const DeleteTeacherController = () => import('#controllers/teachers/delete_teacher_controller')
const ListTeacherClassesController = () =>
  import('#controllers/teachers/list_teacher_classes_controller')
const ListTeacherSubjectsController = () =>
  import('#controllers/teachers/list_teacher_subjects_controller')
const AssignTeacherToClassController = () =>
  import('#controllers/teachers/assign_teacher_to_class_controller')
const RemoveTeacherFromClassController = () =>
  import('#controllers/teachers/remove_teacher_from_class_controller')

// Exams
const ListExamsController = () => import('#controllers/exams/list_exams_controller')
const ShowExamController = () => import('#controllers/exams/show_exam_controller')
const CreateExamController = () => import('#controllers/exams/create_exam_controller')
const UpdateExamController = () => import('#controllers/exams/update_exam_controller')
const DeleteExamController = () => import('#controllers/exams/delete_exam_controller')
const ListExamGradesController = () => import('#controllers/exams/list_exam_grades_controller')
const SaveExamGradeController = () => import('#controllers/exams/save_exam_grade_controller')
const UpdateExamGradeController = () => import('#controllers/exams/update_exam_grade_controller')

// Attendance
const ListAttendanceController = () => import('#controllers/attendance/list_attendance_controller')
const ShowAttendanceController = () => import('#controllers/attendance/show_attendance_controller')
const CreateAttendanceController = () =>
  import('#controllers/attendance/create_attendance_controller')
const BatchCreateAttendanceController = () =>
  import('#controllers/attendance/batch_create_attendance_controller')
const UpdateAttendanceController = () =>
  import('#controllers/attendance/update_attendance_controller')
const GetStudentAttendanceController = () =>
  import('#controllers/attendance/get_student_attendance_controller')

// Assignments
const ListAssignmentsController = () =>
  import('#controllers/assignments/list_assignments_controller')
const ShowAssignmentController = () => import('#controllers/assignments/show_assignment_controller')
const CreateAssignmentController = () =>
  import('#controllers/assignments/create_assignment_controller')
const UpdateAssignmentController = () =>
  import('#controllers/assignments/update_assignment_controller')
const DeleteAssignmentController = () =>
  import('#controllers/assignments/delete_assignment_controller')
const ListAssignmentSubmissionsController = () =>
  import('#controllers/assignments/list_assignment_submissions_controller')
const SubmitAssignmentController = () =>
  import('#controllers/assignments/submit_assignment_controller')
const GradeSubmissionController = () =>
  import('#controllers/assignments/grade_submission_controller')

// Student Payments
const ListStudentPaymentsController = () =>
  import('#controllers/student_payments/list_student_payments_controller')
const ShowStudentPaymentController = () =>
  import('#controllers/student_payments/show_student_payment_controller')
const CreateStudentPaymentController = () =>
  import('#controllers/student_payments/create_student_payment_controller')
const UpdateStudentPaymentController = () =>
  import('#controllers/student_payments/update_student_payment_controller')
const CancelStudentPaymentController = () =>
  import('#controllers/student_payments/cancel_student_payment_controller')
const MarkPaymentAsPaidController = () =>
  import('#controllers/student_payments/mark_payment_as_paid_controller')
const CreateStudentPaymentAsaasChargeController = () =>
  import('#controllers/student_payments/create_student_payment_asaas_charge_controller')
const SendStudentPaymentBoletoEmailController = () =>
  import('#controllers/student_payments/send_student_payment_boleto_email_controller')
const GetStudentPaymentBoletoController = () =>
  import('#controllers/student_payments/get_student_payment_boleto_controller')
const ListStudentPaymentsByStudentController = () =>
  import('#controllers/student_payments/list_student_payments_by_student_controller')

// Asaas
const AsaasWebhookController = () => import('#controllers/asaas/asaas_webhook_controller')

// Student Balance Transactions
const ListStudentBalanceTransactionsController = () =>
  import('#controllers/student_balance_transactions/list_student_balance_transactions_controller')
const ShowStudentBalanceTransactionController = () =>
  import('#controllers/student_balance_transactions/show_student_balance_transaction_controller')
const CreateStudentBalanceTransactionController = () =>
  import('#controllers/student_balance_transactions/create_student_balance_transaction_controller')
const ListStudentBalanceByStudentController = () =>
  import('#controllers/student_balance_transactions/list_student_balance_by_student_controller')
const GetStudentBalanceController = () =>
  import('#controllers/student_balance_transactions/get_student_balance_controller')

// Contract Payment Days
const ListContractPaymentDaysController = () =>
  import('#controllers/contracts/list_contract_payment_days_controller')
const AddContractPaymentDayController = () =>
  import('#controllers/contracts/add_contract_payment_day_controller')
const RemoveContractPaymentDayController = () =>
  import('#controllers/contracts/remove_contract_payment_day_controller')

// Contract Interest Config
const ShowContractInterestConfigController = () =>
  import('#controllers/contracts/show_contract_interest_config_controller')
const UpdateContractInterestConfigController = () =>
  import('#controllers/contracts/update_contract_interest_config_controller')

// Contract Early Discounts
const ListContractEarlyDiscountsController = () =>
  import('#controllers/contracts/list_contract_early_discounts_controller')
const AddContractEarlyDiscountController = () =>
  import('#controllers/contracts/add_contract_early_discount_controller')
const UpdateContractEarlyDiscountController = () =>
  import('#controllers/contracts/update_contract_early_discount_controller')
const RemoveContractEarlyDiscountController = () =>
  import('#controllers/contracts/remove_contract_early_discount_controller')

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
const ListPurchasesByUserController = () =>
  import('#controllers/canteen_purchases/list_purchases_by_user_controller')

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

// Student Gamifications
const ListStudentGamificationsController = () =>
  import('#controllers/student_gamifications/list_student_gamifications_controller')
const ShowStudentGamificationController = () =>
  import('#controllers/student_gamifications/show_student_gamification_controller')
const CreateStudentGamificationController = () =>
  import('#controllers/student_gamifications/create_student_gamification_controller')
const AddPointsController = () => import('#controllers/student_gamifications/add_points_controller')
const GetStudentStatsController = () =>
  import('#controllers/student_gamifications/get_student_stats_controller')
const GetPointsRankingController = () =>
  import('#controllers/student_gamifications/get_points_ranking_controller')

// Leaderboards
const ListLeaderboardsController = () =>
  import('#controllers/leaderboards/list_leaderboards_controller')
const ShowLeaderboardController = () =>
  import('#controllers/leaderboards/show_leaderboard_controller')
const CreateLeaderboardController = () =>
  import('#controllers/leaderboards/create_leaderboard_controller')
const UpdateLeaderboardController = () =>
  import('#controllers/leaderboards/update_leaderboard_controller')
const DeleteLeaderboardController = () =>
  import('#controllers/leaderboards/delete_leaderboard_controller')
const ListLeaderboardEntriesController = () =>
  import('#controllers/leaderboards/list_leaderboard_entries_controller')

// Gamification Events
const ListGamificationEventsController = () =>
  import('#controllers/gamification_events/list_gamification_events_controller')
const ShowGamificationEventController = () =>
  import('#controllers/gamification_events/show_gamification_event_controller')
const CreateGamificationEventController = () =>
  import('#controllers/gamification_events/create_gamification_event_controller')
const RetryGamificationEventController = () =>
  import('#controllers/gamification_events/retry_gamification_event_controller')

// Platform Settings
const ShowPlatformSettingsController = () =>
  import('#controllers/platform_settings/show_platform_settings_controller')
const UpdatePlatformSettingsController = () =>
  import('#controllers/platform_settings/update_platform_settings_controller')

// Subscription Plans
const ListSubscriptionPlansController = () =>
  import('#controllers/subscription_plans/list_subscription_plans_controller')
const ShowSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/show_subscription_plan_controller')
const CreateSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/create_subscription_plan_controller')
const UpdateSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/update_subscription_plan_controller')
const DeleteSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/delete_subscription_plan_controller')

// Subscriptions
const ListSubscriptionsController = () =>
  import('#controllers/subscriptions/list_subscriptions_controller')
const ShowSubscriptionController = () =>
  import('#controllers/subscriptions/show_subscription_controller')
const CreateSubscriptionController = () =>
  import('#controllers/subscriptions/create_subscription_controller')
const UpdateSubscriptionController = () =>
  import('#controllers/subscriptions/update_subscription_controller')
const CancelSubscriptionController = () =>
  import('#controllers/subscriptions/cancel_subscription_controller')
const PauseSubscriptionController = () =>
  import('#controllers/subscriptions/pause_subscription_controller')
const ReactivateSubscriptionController = () =>
  import('#controllers/subscriptions/reactivate_subscription_controller')
const GetSchoolSubscriptionController = () =>
  import('#controllers/subscriptions/get_school_subscription_controller')
const GetChainSubscriptionController = () =>
  import('#controllers/subscriptions/get_chain_subscription_controller')

// Subscription Invoices
const ListSubscriptionInvoicesController = () =>
  import('#controllers/subscription_invoices/list_subscription_invoices_controller')
const ShowSubscriptionInvoiceController = () =>
  import('#controllers/subscription_invoices/show_subscription_invoice_controller')
const CreateSubscriptionInvoiceController = () =>
  import('#controllers/subscription_invoices/create_subscription_invoice_controller')
const UpdateSubscriptionInvoiceController = () =>
  import('#controllers/subscription_invoices/update_subscription_invoice_controller')
const MarkInvoicePaidController = () =>
  import('#controllers/subscription_invoices/mark_invoice_paid_controller')

// School Usage Metrics
const GetSchoolUsageMetricsController = () =>
  import('#controllers/school_usage_metrics/get_school_usage_metrics_controller')

// =============================================================================
// API ROUTE FUNCTIONS
// =============================================================================

function registerAuthApiRoutes() {
  // Public
  router
    .group(() => {
      router.post('/login', [LoginController, 'handle']).as('auth.login')
    })
    .prefix('/auth')

  // Protected
  router
    .group(() => {
      router.post('/logout', [LogoutController, 'handle']).as('auth.logout')
      router.get('/me', [MeController, 'handle']).as('auth.me')
    })
    .prefix('/auth')
    .use(middleware.auth())
}

function registerSchoolApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexSchoolsController, 'handle']).as('schools.index')
      router.post('/', [StoreSchoolController, 'handle']).as('schools.store')
      router.get('/slug/:slug', [ShowSchoolBySlugController, 'handle']).as('schools.showBySlug')
      router.get('/:id', [ShowSchoolController, 'handle']).as('schools.show')
      router.put('/:id', [UpdateSchoolController, 'handle']).as('schools.update')
      router.delete('/:id', [DestroySchoolController, 'handle']).as('schools.destroy')
    })
    .prefix('/schools')
}

function registerUserApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexUsersController, 'handle']).as('users.index')
      router.post('/', [StoreUserController, 'handle']).as('users.store')
      router.get('/:id', [ShowUserController, 'handle']).as('users.show')
      router.put('/:id', [UpdateUserController, 'handle']).as('users.update')
      router.delete('/:id', [DestroyUserController, 'handle']).as('users.destroy')

      // User Canteen Purchases
      router
        .get('/:userId/canteen-purchases', [ListPurchasesByUserController, 'handle'])
        .as('users.canteenPurchases')
    })
    .prefix('/users')
    .use(middleware.auth())
}

function registerUserSchoolApiRoutes() {
  const ListUserSchoolsController = () =>
    import('#controllers/user_schools/list_user_schools_controller')
  const CreateUserSchoolController = () =>
    import('#controllers/user_schools/create_user_school_controller')
  const UpdateUserSchoolController = () =>
    import('#controllers/user_schools/update_user_school_controller')
  const DeleteUserSchoolController = () =>
    import('#controllers/user_schools/delete_user_school_controller')

  router
    .group(() => {
      router.get('/', [ListUserSchoolsController, 'handle']).as('userSchools.listUserSchools')
      router.post('/', [CreateUserSchoolController, 'handle']).as('userSchools.createUserSchool')
      router.put('/:id', [UpdateUserSchoolController, 'handle']).as('userSchools.updateUserSchool')
      router
        .delete('/:id', [DeleteUserSchoolController, 'handle'])
        .as('userSchools.deleteUserSchool')
    })
    .prefix('/user-schools')
    .use(middleware.auth())
}

function registerUserSchoolGroupApiRoutes() {
  const ListUserSchoolGroupsController = () =>
    import('#controllers/user_school_groups/list_user_school_groups_controller')
  const CreateUserSchoolGroupController = () =>
    import('#controllers/user_school_groups/create_user_school_group_controller')
  const DeleteUserSchoolGroupController = () =>
    import('#controllers/user_school_groups/delete_user_school_group_controller')

  router
    .group(() => {
      router
        .get('/', [ListUserSchoolGroupsController, 'handle'])
        .as('userSchoolGroups.listUserSchoolGroups')
      router
        .post('/', [CreateUserSchoolGroupController, 'handle'])
        .as('userSchoolGroups.createUserSchoolGroup')
      router
        .delete('/:id', [DeleteUserSchoolGroupController, 'handle'])
        .as('userSchoolGroups.deleteUserSchoolGroup')
    })
    .prefix('/user-school-groups')
    .use(middleware.auth())
}

function registerStudentApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexStudentsController, 'handle']).as('students.index')
      router.post('/', [StoreStudentController, 'handle']).as('students.store')
      router.get('/:id', [ShowStudentController, 'handle']).as('students.show')
      router.put('/:id', [UpdateStudentController, 'handle']).as('students.update')
      router.delete('/:id', [DestroyStudentController, 'handle']).as('students.destroy')
      router
        .get('/:studentId/attendance', [GetStudentAttendanceController, 'handle'])
        .as('students.attendance')

      // Student Payments
      router
        .get('/:studentId/payments', [ListStudentPaymentsByStudentController, 'handle'])
        .as('students.payments')

      // Student Balance
      router
        .get('/:studentId/balance', [GetStudentBalanceController, 'handle'])
        .as('students.balance')
      router
        .get('/:studentId/balance-transactions', [ListStudentBalanceByStudentController, 'handle'])
        .as('students.balanceTransactions')
    })
    .prefix('/students')
    .use(middleware.auth())
}

function registerResponsibleApiRoutes() {
  router
    .group(() => {
      router
        .get('/students/:studentId/responsibles', [ListStudentResponsiblesController, 'handle'])
        .as('responsibles.listByStudent')
      router
        .post('/responsibles', [AssignResponsibleController, 'handle'])
        .as('responsibles.assign')
      router
        .put('/responsibles/:id', [UpdateResponsibleAssignmentController, 'handle'])
        .as('responsibles.updateAssignment')
      router
        .delete('/responsibles/:id', [RemoveResponsibleController, 'handle'])
        .as('responsibles.remove')
    })
    .use(middleware.auth())
}

function registerResponsibleAddressApiRoutes() {
  router
    .group(() => {
      router
        .get('/responsible-addresses/:responsibleId', [ShowResponsibleAddressController, 'handle'])
        .as('responsibleAddresses.show')
      router
        .post('/responsible-addresses', [CreateResponsibleAddressController, 'handle'])
        .as('responsibleAddresses.create')
    })
    .use(middleware.auth())
}

function registerContractApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListContractsController, 'handle']).as('contracts.index')
      router.post('/', [CreateContractController, 'handle']).as('contracts.store')
      router.get('/:id', [ShowContractController, 'handle']).as('contracts.show')
      router.put('/:id', [UpdateContractController, 'handle']).as('contracts.update')
      router.delete('/:id', [DeleteContractController, 'handle']).as('contracts.destroy')

      router
        .get('/:contractId/signature-stats', [GetSignatureStatsController, 'handle'])
        .as('contracts.getSignatureStats')

      router
        .get('/:contractId/docuseal-template', [GetDocusealTemplateController, 'handle'])
        .as('contracts.getDocusealTemplate')
      router
        .post('/:contractId/docuseal-template', [UploadDocusealTemplateController, 'handle'])
        .as('contracts.uploadDocusealTemplate')
      router
        .delete('/:contractId/docuseal-template', [DeleteDocusealTemplateController, 'handle'])
        .as('contracts.deleteDocusealTemplate')

      // Payment Days (nested)
      router
        .get('/:contractId/payment-days', [ListContractPaymentDaysController, 'handle'])
        .as('contracts.paymentDays.index')
      router
        .post('/:contractId/payment-days', [AddContractPaymentDayController, 'handle'])
        .as('contracts.paymentDays.store')
      router
        .delete('/:contractId/payment-days/:id', [RemoveContractPaymentDayController, 'handle'])
        .as('contracts.paymentDays.destroy')

      // Interest Config (nested)
      router
        .get('/:contractId/interest-config', [ShowContractInterestConfigController, 'handle'])
        .as('contracts.interestConfig.show')
      router
        .put('/:contractId/interest-config', [UpdateContractInterestConfigController, 'handle'])
        .as('contracts.interestConfig.update')

      // Early Discounts (nested)
      router
        .get('/:contractId/early-discounts', [ListContractEarlyDiscountsController, 'handle'])
        .as('contracts.earlyDiscounts.index')
      router
        .post('/:contractId/early-discounts', [AddContractEarlyDiscountController, 'handle'])
        .as('contracts.earlyDiscounts.store')
      router
        .put('/:contractId/early-discounts/:id', [UpdateContractEarlyDiscountController, 'handle'])
        .as('contracts.earlyDiscounts.update')
      router
        .delete('/:contractId/early-discounts/:id', [
          RemoveContractEarlyDiscountController,
          'handle',
        ])
        .as('contracts.earlyDiscounts.destroy')
    })
    .prefix('/contracts')
    .use(middleware.auth())
}

function registerContractDocumentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListContractDocumentsController, 'handle']).as('contractDocuments.index')
      router.post('/', [CreateContractDocumentController, 'handle']).as('contractDocuments.store')
    })
    .prefix('/contract-documents')
    .use(middleware.auth())
}

function registerCourseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCoursesController, 'handle']).as('courses.index')
      router.post('/', [CreateCourseController, 'handle']).as('courses.store')
      router.get('/:id', [ShowCourseController, 'handle']).as('courses.show')
      router.put('/:id', [UpdateCourseController, 'handle']).as('courses.update')
      router.delete('/:id', [DeleteCourseController, 'handle']).as('courses.destroy')
    })
    .prefix('/courses')
    .use(middleware.auth())
}

function registerLevelApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListLevelsController, 'handle']).as('levels.index')
      router.post('/', [CreateLevelController, 'handle']).as('levels.store')
      router.get('/:id', [ShowLevelController, 'handle']).as('levels.show')
      router.put('/:id', [UpdateLevelController, 'handle']).as('levels.update')
      router.delete('/:id', [DeleteLevelController, 'handle']).as('levels.destroy')
    })
    .prefix('/levels')
    .use(middleware.auth())
}

function registerClassApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListClassesController, 'handle']).as('classes.index')
      router.post('/', [CreateClassController, 'handle']).as('classes.store')
      router.get('/slug/:slug', [ShowClassBySlugController, 'handle']).as('classes.showBySlug')
      router.get('/:id', [ShowClassController, 'handle']).as('classes.show')
      router.put('/:id', [UpdateClassController, 'handle']).as('classes.update')
      router.delete('/:id', [DeleteClassController, 'handle']).as('classes.destroy')
      router.get('/:id/students', [ListClassStudentsController, 'handle']).as('classes.students')
      router
        .get('/:id/students/count', [CountClassStudentsController, 'handle'])
        .as('classes.studentsCount')
      router
        .get('/:classId/subjects', [ListSubjectsForClassController, 'handle'])
        .as('classes.subjects')
    })
    .prefix('/classes')
    .use(middleware.auth())
}

function registerSubjectApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubjectsController, 'handle']).as('subjects.index')
      router.post('/', [CreateSubjectController, 'handle']).as('subjects.store')
      router.get('/slug/:slug', [ShowSubjectBySlugController, 'handle']).as('subjects.showBySlug')
      router.get('/:id', [ShowSubjectController, 'handle']).as('subjects.show')
      router.put('/:id', [UpdateSubjectController, 'handle']).as('subjects.update')
      router.delete('/:id', [DeleteSubjectController, 'handle']).as('subjects.destroy')
    })
    .prefix('/subjects')
    .use(middleware.auth())
}

function registerTeacherApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListTeachersController, 'handle']).as('teachers.listTeachers')
      router.post('/', [CreateTeacherController, 'handle']).as('teachers.createTeacher')
      router.get('/:id', [ShowTeacherController, 'handle']).as('teachers.showTeacher')
      router.put('/:id', [UpdateTeacherController, 'handle']).as('teachers.updateTeacher')
      router.delete('/:id', [DeleteTeacherController, 'handle']).as('teachers.deleteTeacher')
      router
        .get('/:id/classes', [ListTeacherClassesController, 'handle'])
        .as('teachers.listTeacherClasses')
      router
        .get('/:id/subjects', [ListTeacherSubjectsController, 'handle'])
        .as('teachers.listTeacherSubjects')

      router
        .get('/timesheet', [
          () => import('#controllers/teachers/get_teachers_timesheet_controller'),
          'handle',
        ])
        .as('teachers.getTeachersTimesheet')
      router
        .get('/absences', [
          () => import('#controllers/teachers/get_teacher_absences_controller'),
          'handle',
        ])
        .as('teachers.getTeacherAbsences')
      router
        .patch('/absences/approve', [
          () => import('#controllers/teachers/approve_absence_controller'),
          'handle',
        ])
        .as('teachers.approveAbsence')
      router
        .patch('/absences/reject', [
          () => import('#controllers/teachers/reject_absence_controller'),
          'handle',
        ])
        .as('teachers.rejectAbsence')
      router
        .post('/:id/classes', [AssignTeacherToClassController, 'handle'])
        .as('teachers.assignClass')
      router
        .delete('/:id/classes/:classId', [RemoveTeacherFromClassController, 'handle'])
        .as('teachers.removeClass')
    })
    .prefix('/teachers')
    .use(middleware.auth())
}

function registerExamApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListExamsController, 'handle']).as('exams.index')
      router.post('/', [CreateExamController, 'handle']).as('exams.store')
      router.get('/:id', [ShowExamController, 'handle']).as('exams.show')
      router.put('/:id', [UpdateExamController, 'handle']).as('exams.update')
      router.delete('/:id', [DeleteExamController, 'handle']).as('exams.destroy')
      router.get('/:id/grades', [ListExamGradesController, 'handle']).as('exams.grades')
      router.post('/:id/grades', [SaveExamGradeController, 'handle']).as('exams.saveGrade')
      router
        .put('/:id/grades/:gradeId', [UpdateExamGradeController, 'handle'])
        .as('exams.updateGrade')
    })
    .prefix('/exams')
    .use(middleware.auth())
}

function registerAttendanceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAttendanceController, 'handle']).as('attendance.index')
      router.post('/', [CreateAttendanceController, 'handle']).as('attendance.store')
      router.post('/batch', [BatchCreateAttendanceController, 'handle']).as('attendance.batch')
      router.get('/:id', [ShowAttendanceController, 'handle']).as('attendance.show')
      router.put('/:id', [UpdateAttendanceController, 'handle']).as('attendance.update')
    })
    .prefix('/attendance')
    .use(middleware.auth())
}

function registerAssignmentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAssignmentsController, 'handle']).as('assignments.index')
      router.post('/', [CreateAssignmentController, 'handle']).as('assignments.store')
      router.get('/:id', [ShowAssignmentController, 'handle']).as('assignments.show')
      router.put('/:id', [UpdateAssignmentController, 'handle']).as('assignments.update')
      router.delete('/:id', [DeleteAssignmentController, 'handle']).as('assignments.destroy')
      router
        .get('/:id/submissions', [ListAssignmentSubmissionsController, 'handle'])
        .as('assignments.submissions')
      router
        .post('/:id/submissions', [SubmitAssignmentController, 'handle'])
        .as('assignments.submit')
      router
        .put('/:id/submissions/:submissionId', [GradeSubmissionController, 'handle'])
        .as('assignments.grade')
    })
    .prefix('/assignments')
    .use(middleware.auth())
}

function registerStudentPaymentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStudentPaymentsController, 'handle']).as('studentPayments.index')
      router.post('/', [CreateStudentPaymentController, 'handle']).as('studentPayments.store')
      router.get('/:id', [ShowStudentPaymentController, 'handle']).as('studentPayments.show')
      router.put('/:id', [UpdateStudentPaymentController, 'handle']).as('studentPayments.update')
      router
        .post('/:id/cancel', [CancelStudentPaymentController, 'handle'])
        .as('studentPayments.cancel')
      router
        .post('/:id/mark-paid', [MarkPaymentAsPaidController, 'handle'])
        .as('studentPayments.markPaid')
      router
        .post('/:id/asaas-charge', [CreateStudentPaymentAsaasChargeController, 'handle'])
        .as('studentPayments.asaasCharge')
      router
        .post('/:id/send-boleto', [SendStudentPaymentBoletoEmailController, 'handle'])
        .as('studentPayments.sendBoleto')
      router
        .get('/:id/boleto', [GetStudentPaymentBoletoController, 'handle'])
        .as('studentPayments.getBoleto')
    })
    .prefix('/student-payments')
    .use(middleware.auth())
}

function registerStudentBalanceTransactionApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListStudentBalanceTransactionsController, 'handle'])
        .as('studentBalanceTransactions.index')
      router
        .post('/', [CreateStudentBalanceTransactionController, 'handle'])
        .as('studentBalanceTransactions.store')
      router
        .get('/:id', [ShowStudentBalanceTransactionController, 'handle'])
        .as('studentBalanceTransactions.show')
    })
    .prefix('/student-balance-transactions')
    .use(middleware.auth())
}

function registerAsaasWebhookApiRoutes() {
  router
    .group(() => {
      router.post('/webhook', [AsaasWebhookController, 'handle']).as('asaas.webhook')
    })
    .prefix('/asaas')
}

function registerCanteenApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteensController, 'handle']).as('canteens.index')
      router.post('/', [CreateCanteenController, 'handle']).as('canteens.store')
      router.get('/:id', [ShowCanteenController, 'handle']).as('canteens.show')
      router.put('/:id', [UpdateCanteenController, 'handle']).as('canteens.update')
      router.delete('/:id', [DeleteCanteenController, 'handle']).as('canteens.destroy')
      router.get('/:canteenId/items', [ListItemsByCanteenController, 'handle']).as('canteens.items')
    })
    .prefix('/canteens')
    .use(middleware.auth())
}

function registerCanteenReportApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetCanteenReportController, 'handle']).as('canteenReports.summary')
    })
    .prefix('/canteen-reports')
    .use(middleware.auth())
}

function registerCanteenMonthlyTransferApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListCanteenMonthlyTransfersController, 'handle'])
        .as('canteenMonthlyTransfers.index')
      router
        .post('/', [CreateCanteenMonthlyTransferController, 'handle'])
        .as('canteenMonthlyTransfers.store')
      router
        .get('/:id', [ShowCanteenMonthlyTransferController, 'handle'])
        .as('canteenMonthlyTransfers.show')
      router
        .put('/:id/status', [UpdateCanteenMonthlyTransferStatusController, 'handle'])
        .as('canteenMonthlyTransfers.updateStatus')
    })
    .prefix('/canteen-monthly-transfers')
    .use(middleware.auth())
}

function registerCanteenItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenItemsController, 'handle']).as('canteenItems.index')
      router.post('/', [CreateCanteenItemController, 'handle']).as('canteenItems.store')
      router.get('/:id', [ShowCanteenItemController, 'handle']).as('canteenItems.show')
      router.put('/:id', [UpdateCanteenItemController, 'handle']).as('canteenItems.update')
      router.delete('/:id', [DeleteCanteenItemController, 'handle']).as('canteenItems.destroy')
      router
        .get('/:id/toggle-active', [ToggleCanteenItemActiveController, 'handle'])
        .as('canteenItems.toggleActive')
    })
    .prefix('/canteen-items')
    .use(middleware.auth())
}

function registerCanteenMealApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealsController, 'handle']).as('canteenMeals.index')
      router.post('/', [CreateCanteenMealController, 'handle']).as('canteenMeals.store')
      router.get('/:id', [ShowCanteenMealController, 'handle']).as('canteenMeals.show')
      router.put('/:id', [UpdateCanteenMealController, 'handle']).as('canteenMeals.update')
      router.delete('/:id', [DeleteCanteenMealController, 'handle']).as('canteenMeals.destroy')
    })
    .prefix('/canteen-meals')
    .use(middleware.auth())
}

function registerCanteenMealReservationApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListCanteenMealReservationsController, 'handle'])
        .as('canteenMealReservations.index')
      router
        .post('/', [CreateCanteenMealReservationController, 'handle'])
        .as('canteenMealReservations.store')
      router
        .get('/:id', [ShowCanteenMealReservationController, 'handle'])
        .as('canteenMealReservations.show')
      router
        .put('/:id/status', [UpdateCanteenMealReservationStatusController, 'handle'])
        .as('canteenMealReservations.updateStatus')
      router
        .delete('/:id', [DeleteCanteenMealReservationController, 'handle'])
        .as('canteenMealReservations.cancel')
    })
    .prefix('/canteen-meal-reservations')
    .use(middleware.auth())
}

function registerCanteenPurchaseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenPurchasesController, 'handle']).as('canteenPurchases.index')
      router.post('/', [CreateCanteenPurchaseController, 'handle']).as('canteenPurchases.store')
      router.get('/:id', [ShowCanteenPurchaseController, 'handle']).as('canteenPurchases.show')
      router
        .put('/:id/status', [UpdateCanteenPurchaseStatusController, 'handle'])
        .as('canteenPurchases.updateStatus')
      router
        .post('/:id/cancel', [CancelCanteenPurchaseController, 'handle'])
        .as('canteenPurchases.cancel')
    })
    .prefix('/canteen-purchases')
    .use(middleware.auth())
}

function registerAchievementApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAchievementsController, 'handle']).as('achievements.index')
      router.post('/', [CreateAchievementController, 'handle']).as('achievements.store')
      router.get('/:id', [ShowAchievementController, 'handle']).as('achievements.show')
      router.put('/:id', [UpdateAchievementController, 'handle']).as('achievements.update')
      router.delete('/:id', [DeleteAchievementController, 'handle']).as('achievements.destroy')
      router.post('/:id/unlock', [UnlockAchievementController, 'handle']).as('achievements.unlock')
    })
    .prefix('/achievements')
    .use(middleware.auth())
}

function registerStoreItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreItemsController, 'handle']).as('storeItems.index')
      router.post('/', [CreateStoreItemController, 'handle']).as('storeItems.store')
      router.get('/:id', [ShowStoreItemController, 'handle']).as('storeItems.show')
      router.put('/:id', [UpdateStoreItemController, 'handle']).as('storeItems.update')
      router.delete('/:id', [DeleteStoreItemController, 'handle']).as('storeItems.destroy')
      router
        .patch('/:id/toggle-active', [ToggleStoreItemActiveController, 'handle'])
        .as('storeItems.toggleActive')
    })
    .prefix('/store-items')
    .use(middleware.auth())
}

function registerStoreOrderApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreOrdersController, 'handle']).as('storeOrders.index')
      router.post('/', [CreateStoreOrderController, 'handle']).as('storeOrders.store')
      router.get('/:id', [ShowStoreOrderController, 'handle']).as('storeOrders.show')
      router.post('/:id/approve', [ApproveStoreOrderController, 'handle']).as('storeOrders.approve')
      router.post('/:id/reject', [RejectStoreOrderController, 'handle']).as('storeOrders.reject')
      router.post('/:id/deliver', [DeliverStoreOrderController, 'handle']).as('storeOrders.deliver')
      router.post('/:id/cancel', [CancelStoreOrderController, 'handle']).as('storeOrders.cancel')
    })
    .prefix('/store-orders')
    .use(middleware.auth())
}

function registerStudentGamificationApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListStudentGamificationsController, 'handle'])
        .as('studentGamifications.index')
      router
        .post('/', [CreateStudentGamificationController, 'handle'])
        .as('studentGamifications.store')
      router
        .get('/:id', [ShowStudentGamificationController, 'handle'])
        .as('studentGamifications.show')
      router
        .post('/add-points', [AddPointsController, 'handle'])
        .as('studentGamifications.addPoints')
      router
        .get('/ranking', [GetPointsRankingController, 'handle'])
        .as('studentGamifications.ranking')
    })
    .prefix('/student-gamifications')
    .use(middleware.auth())

  // Student stats route (nested under students)
  router
    .group(() => {
      router
        .get('/:studentId/gamification/stats', [GetStudentStatsController, 'handle'])
        .as('students.gamificationStats')
    })
    .prefix('/students')
    .use(middleware.auth())
}

function registerLeaderboardApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListLeaderboardsController, 'handle']).as('leaderboards.index')
      router.post('/', [CreateLeaderboardController, 'handle']).as('leaderboards.store')
      router.get('/:id', [ShowLeaderboardController, 'handle']).as('leaderboards.show')
      router.put('/:id', [UpdateLeaderboardController, 'handle']).as('leaderboards.update')
      router.delete('/:id', [DeleteLeaderboardController, 'handle']).as('leaderboards.destroy')
      router
        .get('/:id/entries', [ListLeaderboardEntriesController, 'handle'])
        .as('leaderboards.entries')
    })
    .prefix('/leaderboards')
    .use(middleware.auth())
}

function registerGamificationEventApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListGamificationEventsController, 'handle']).as('gamificationEvents.index')
      router.post('/', [CreateGamificationEventController, 'handle']).as('gamificationEvents.store')
      router.get('/:id', [ShowGamificationEventController, 'handle']).as('gamificationEvents.show')
      router
        .post('/:id/retry', [RetryGamificationEventController, 'handle'])
        .as('gamificationEvents.retry')
    })
    .prefix('/gamification-events')
    .use(middleware.auth())
}

function registerScholarshipApiRoutes() {
  const ListScholarshipsController = () =>
    import('#controllers/scholarships/list_scholarships_controller')
  const CreateScholarshipController = () =>
    import('#controllers/scholarships/create_scholarship_controller')
  const ShowScholarshipController = () =>
    import('#controllers/scholarships/show_scholarship_controller')
  const UpdateScholarshipController = () =>
    import('#controllers/scholarships/update_scholarship_controller')
  const ToggleScholarshipActiveController = () =>
    import('#controllers/scholarships/toggle_scholarship_active_controller')

  router
    .group(() => {
      router.get('/', [ListScholarshipsController, 'handle']).as('scholarships.listScholarships')
      router.post('/', [CreateScholarshipController, 'handle']).as('scholarships.createScholarship')
      router.get('/:id', [ShowScholarshipController, 'handle']).as('scholarships.showScholarship')
      router
        .put('/:id', [UpdateScholarshipController, 'handle'])
        .as('scholarships.updateScholarship')
      router
        .patch('/:id/toggle-active', [ToggleScholarshipActiveController, 'handle'])
        .as('scholarships.toggleScholarshipActive')
    })
    .prefix('/scholarships')
    .use(middleware.auth())
}

function registerSchoolPartnerApiRoutes() {
  const ListSchoolPartnersController = () =>
    import('#controllers/school_partners/list_school_partners_controller')
  const CreateSchoolPartnerController = () =>
    import('#controllers/school_partners/create_school_partner_controller')
  const ShowSchoolPartnerController = () =>
    import('#controllers/school_partners/show_school_partner_controller')
  const UpdateSchoolPartnerController = () =>
    import('#controllers/school_partners/update_school_partner_controller')
  const ToggleSchoolPartnerActiveController = () =>
    import('#controllers/school_partners/toggle_school_partner_active_controller')

  router
    .group(() => {
      router
        .get('/', [ListSchoolPartnersController, 'handle'])
        .as('schoolPartners.listSchoolPartners')
      router
        .post('/', [CreateSchoolPartnerController, 'handle'])
        .as('schoolPartners.createSchoolPartner')
      router
        .get('/:id', [ShowSchoolPartnerController, 'handle'])
        .as('schoolPartners.showSchoolPartner')
      router
        .put('/:id', [UpdateSchoolPartnerController, 'handle'])
        .as('schoolPartners.updateSchoolPartner')
      router
        .patch('/:id/toggle-active', [ToggleSchoolPartnerActiveController, 'handle'])
        .as('schoolPartners.toggleSchoolPartnerActive')
    })
    .prefix('/school-partners')
    .use(middleware.auth())
}

function registerSchoolChainApiRoutes() {
  const ListSchoolChainsController = () =>
    import('#controllers/school_chains/list_school_chains_controller')
  const CreateSchoolChainController = () =>
    import('#controllers/school_chains/create_school_chain_controller')
  const ShowSchoolChainController = () =>
    import('#controllers/school_chains/show_school_chain_controller')
  const UpdateSchoolChainController = () =>
    import('#controllers/school_chains/update_school_chain_controller')
  const DeleteSchoolChainController = () =>
    import('#controllers/school_chains/delete_school_chain_controller')

  router
    .group(() => {
      router.get('/', [ListSchoolChainsController, 'handle']).as('schoolChains.listSchoolChains')
      router.post('/', [CreateSchoolChainController, 'handle']).as('schoolChains.createSchoolChain')
      router.get('/:id', [ShowSchoolChainController, 'handle']).as('schoolChains.showSchoolChain')
      router
        .put('/:id', [UpdateSchoolChainController, 'handle'])
        .as('schoolChains.updateSchoolChain')
      router
        .delete('/:id', [DeleteSchoolChainController, 'handle'])
        .as('schoolChains.deleteSchoolChain')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

function registerSchoolGroupApiRoutes() {
  const ListSchoolGroupsController = () =>
    import('#controllers/school_groups/list_school_groups_controller')
  const CreateSchoolGroupController = () =>
    import('#controllers/school_groups/create_school_group_controller')
  const ShowSchoolGroupController = () =>
    import('#controllers/school_groups/show_school_group_controller')
  const UpdateSchoolGroupController = () =>
    import('#controllers/school_groups/update_school_group_controller')
  const DeleteSchoolGroupController = () =>
    import('#controllers/school_groups/delete_school_group_controller')

  router
    .group(() => {
      router.get('/', [ListSchoolGroupsController, 'handle']).as('schoolGroups.listSchoolGroups')
      router.post('/', [CreateSchoolGroupController, 'handle']).as('schoolGroups.createSchoolGroup')
      router.get('/:id', [ShowSchoolGroupController, 'handle']).as('schoolGroups.showSchoolGroup')
      router
        .put('/:id', [UpdateSchoolGroupController, 'handle'])
        .as('schoolGroups.updateSchoolGroup')
      router
        .delete('/:id', [DeleteSchoolGroupController, 'handle'])
        .as('schoolGroups.deleteSchoolGroup')
    })
    .prefix('/school-groups')
    .use(middleware.auth())
}

function registerAcademicPeriodApiRoutes() {
  const ListAcademicPeriodsController = () =>
    import('#controllers/academic_periods/list_academic_periods_controller')
  const GetCurrentActiveAcademicPeriodsController = () =>
    import('#controllers/academic_periods/get_current_active_academic_periods_controller')
  const CreateAcademicPeriodController = () =>
    import('#controllers/academic_periods/create_academic_period_controller')
  const ShowAcademicPeriodController = () =>
    import('#controllers/academic_periods/show_academic_period_controller')
  const UpdateAcademicPeriodController = () =>
    import('#controllers/academic_periods/update_academic_period_controller')

  router
    .group(() => {
      router
        .get('/', [ListAcademicPeriodsController, 'handle'])
        .as('academicPeriods.listAcademicPeriods')
      router
        .get('/current-active', [GetCurrentActiveAcademicPeriodsController, 'handle'])
        .as('academicPeriods.getCurrentActiveAcademicPeriods')
      router
        .post('/', [CreateAcademicPeriodController, 'handle'])
        .as('academicPeriods.createAcademicPeriod')
      router
        .get('/:id', [ShowAcademicPeriodController, 'handle'])
        .as('academicPeriods.showAcademicPeriod')
      router
        .put('/:id', [UpdateAcademicPeriodController, 'handle'])
        .as('academicPeriods.updateAcademicPeriod')
    })
    .prefix('/academic-periods')
    .use(middleware.auth())
}

function registerPrintRequestApiRoutes() {
  const ListPrintRequestsController = () =>
    import('#controllers/print_requests/list_print_requests_controller')
  const CreatePrintRequestController = () =>
    import('#controllers/print_requests/create_print_request_controller')
  const ShowPrintRequestController = () =>
    import('#controllers/print_requests/show_print_request_controller')
  const ApprovePrintRequestController = () =>
    import('#controllers/print_requests/approve_print_request_controller')
  const RejectPrintRequestController = () =>
    import('#controllers/print_requests/reject_print_request_controller')
  const ReviewPrintRequestController = () =>
    import('#controllers/print_requests/review_print_request_controller')
  const MarkPrintRequestPrintedController = () =>
    import('#controllers/print_requests/mark_print_request_printed_controller')

  router
    .group(() => {
      router.get('/', [ListPrintRequestsController, 'handle']).as('printRequests.listPrintRequests')
      router
        .post('/', [CreatePrintRequestController, 'handle'])
        .as('printRequests.createPrintRequest')
      router
        .get('/:id', [ShowPrintRequestController, 'handle'])
        .as('printRequests.showPrintRequest')
      router
        .patch('/:id/approve', [ApprovePrintRequestController, 'handle'])
        .as('printRequests.approvePrintRequest')
      router
        .patch('/:id/reject', [RejectPrintRequestController, 'handle'])
        .as('printRequests.rejectPrintRequest')
      router
        .patch('/:id/review', [ReviewPrintRequestController, 'handle'])
        .as('printRequests.reviewPrintRequest')
      router
        .patch('/:id/printed', [MarkPrintRequestPrintedController, 'handle'])
        .as('printRequests.markPrintRequestPrinted')
    })
    .prefix('/print-requests')
    .use(middleware.auth())
}

function registerPlatformSettingsApiRoutes() {
  router
    .group(() => {
      router.get('/', [ShowPlatformSettingsController, 'handle']).as('platformSettings.show')
      router.put('/', [UpdatePlatformSettingsController, 'handle']).as('platformSettings.update')
    })
    .prefix('/platform-settings')
    .use(middleware.auth())
}

function registerSubscriptionPlanApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionPlansController, 'handle']).as('subscriptionPlans.index')
      router.post('/', [CreateSubscriptionPlanController, 'handle']).as('subscriptionPlans.store')
      router.get('/:id', [ShowSubscriptionPlanController, 'handle']).as('subscriptionPlans.show')
      router
        .put('/:id', [UpdateSubscriptionPlanController, 'handle'])
        .as('subscriptionPlans.update')
      router
        .delete('/:id', [DeleteSubscriptionPlanController, 'handle'])
        .as('subscriptionPlans.destroy')
    })
    .prefix('/subscription-plans')
    .use(middleware.auth())
}

function registerSubscriptionApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionsController, 'handle']).as('subscriptions.index')
      router.post('/', [CreateSubscriptionController, 'handle']).as('subscriptions.store')
      router.get('/:id', [ShowSubscriptionController, 'handle']).as('subscriptions.show')
      router.put('/:id', [UpdateSubscriptionController, 'handle']).as('subscriptions.update')
      router
        .post('/:id/cancel', [CancelSubscriptionController, 'handle'])
        .as('subscriptions.cancel')
      router.post('/:id/pause', [PauseSubscriptionController, 'handle']).as('subscriptions.pause')
      router
        .post('/:id/reactivate', [ReactivateSubscriptionController, 'handle'])
        .as('subscriptions.reactivate')
    })
    .prefix('/subscriptions')
    .use(middleware.auth())

  // School subscription route
  router
    .group(() => {
      router
        .get('/:schoolId/subscription', [GetSchoolSubscriptionController, 'handle'])
        .as('schools.subscription')
    })
    .prefix('/schools')
    .use(middleware.auth())

  // School chain subscription route
  router
    .group(() => {
      router
        .get('/:schoolChainId/subscription', [GetChainSubscriptionController, 'handle'])
        .as('schoolChains.subscription')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

function registerSubscriptionInvoiceApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListSubscriptionInvoicesController, 'handle'])
        .as('subscriptionInvoices.index')
      router
        .post('/', [CreateSubscriptionInvoiceController, 'handle'])
        .as('subscriptionInvoices.store')
      router
        .get('/:id', [ShowSubscriptionInvoiceController, 'handle'])
        .as('subscriptionInvoices.show')
      router
        .put('/:id', [UpdateSubscriptionInvoiceController, 'handle'])
        .as('subscriptionInvoices.update')
      router
        .post('/:id/mark-paid', [MarkInvoicePaidController, 'handle'])
        .as('subscriptionInvoices.markPaid')
    })
    .prefix('/subscription-invoices')
    .use(middleware.auth())
}

function registerSchoolUsageMetricsApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetSchoolUsageMetricsController, 'handle']).as('schoolUsageMetrics.show')
    })
    .prefix('/school-usage-metrics')
    .use(middleware.auth())
}

// =============================================================================
// DASHBOARD API CONTROLLERS
// =============================================================================

const GetEscolaStatsController = () => import('#controllers/dashboard/get_escola_stats_controller')
const GetResponsavelStatsController = () =>
  import('#controllers/dashboard/get_responsavel_stats_controller')
const GetAdminStatsController = () => import('#controllers/dashboard/get_admin_stats_controller')

function registerDashboardApiRoutes() {
  router.get('/escola/stats', [GetEscolaStatsController]).as('dashboard.escolaStats')
  router.get('/responsavel/stats', [GetResponsavelStatsController]).as('dashboard.responsavelStats')
  router
    .get('/admin/stats', [GetAdminStatsController])
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
    .as('dashboard.adminStats')
}

// =============================================================================
// PAGE CONTROLLER IMPORTS
// =============================================================================

// Auth Pages
const ShowSignInPageController = () =>
  import('#controllers/pages/auth/show_sign_in_page_controller')

// Dashboard Pages
const ShowDashboardPageController = () =>
  import('#controllers/pages/show_dashboard_page_controller')

// Escola Pages
const ShowEscolaDashboardPageController = () =>
  import('#controllers/pages/escola/show_escola_dashboard_page_controller')
const ShowAlunosPageController = () =>
  import('#controllers/pages/escola/show_alunos_page_controller')
const ShowProfessoresPageController = () =>
  import('#controllers/pages/escola/show_professores_page_controller')
const ShowTurmasPageController = () =>
  import('#controllers/pages/escola/show_turmas_page_controller')
const ShowCantinaItensPageController = () =>
  import('#controllers/pages/escola/show_cantina_itens_page_controller')
const ShowCantinaPedidosPageController = () =>
  import('#controllers/pages/escola/show_cantina_pedidos_page_controller')
const ShowMensalidadesPageController = () =>
  import('#controllers/pages/escola/show_mensalidades_page_controller')
const ShowFuncionariosPageController = () =>
  import('#controllers/pages/escola/show_funcionarios_page_controller')
const ShowMatriculasPageController = () =>
  import('#controllers/pages/escola/show_matriculas_page_controller')
const ShowContratosPageController = () =>
  import('#controllers/pages/escola/show_contratos_page_controller')
const ShowContratoAssinaturasPageController = () =>
  import('#controllers/pages/escola/show_contrato_assinaturas_page_controller')
const ShowContratoDocusealPageController = () =>
  import('#controllers/pages/escola/show_contrato_docuseal_page_controller')
const ShowBolsasPageController = () =>
  import('#controllers/pages/escola/show_bolsas_page_controller')
const ShowParceirosPageController = () =>
  import('#controllers/pages/escola/show_parceiros_page_controller')
const ShowMateriasPageController = () =>
  import('#controllers/pages/escola/show_materias_page_controller')
const ShowFolhaDePontoPageController = () =>
  import('#controllers/pages/escola/show_folha_de_ponto_page_controller')
const ShowImpressaoPageController = () =>
  import('#controllers/pages/escola/show_impressao_page_controller')
const ShowPeriodosLetivosPageController = () =>
  import('#controllers/pages/escola/show_periodos_letivos_page_controller')
const ShowPeriodosLetivosAdminPageController = () =>
  import('#controllers/pages/escola/show_periodos_letivos_admin_page_controller')
const ShowNovoPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_novo_periodo_letivo_page_controller')
const ShowGradePageController = () => import('#controllers/pages/escola/show_grade_page_controller')
const ShowOcorrenciasPageController = () =>
  import('#controllers/pages/escola/show_ocorrencias_page_controller')
const ShowCantinaCardapioPageController = () =>
  import('#controllers/pages/escola/show_cantina_cardapio_page_controller')
const ShowCantinaPdvPageController = () =>
  import('#controllers/pages/escola/show_cantina_pdv_page_controller')
const ShowCantinaVendasPageController = () =>
  import('#controllers/pages/escola/show_cantina_vendas_page_controller')
const ShowInadimplenciaPageController = () =>
  import('#controllers/pages/escola/show_inadimplencia_page_controller')
const ShowGamificacaoPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_page_controller')
const ShowGamificacaoRankingsPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_rankings_page_controller')
const ShowGamificacaoConquistasPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_conquistas_page_controller')
const ShowGamificacaoRecompensasPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_recompensas_page_controller')
const ShowConfiguracoesPageController = () =>
  import('#controllers/pages/escola/show_configuracoes_page_controller')

// Responsavel Pages
const ShowResponsavelDashboardPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_dashboard_page_controller')

// Admin Pages
const ShowAdminDashboardPageController = () =>
  import('#controllers/pages/admin/show_admin_dashboard_page_controller')

// =============================================================================
// PAGE ROUTE FUNCTIONS (Inertia)
// =============================================================================

function registerPageRoutes() {
  router
    .group(() => {
      // Public home
      router.on('/').renderInertia('home').as('home')

      // Auth pages
      router.get('/sign-in', [ShowSignInPageController]).as('auth.signIn')
      router.get('/login', [ShowSignInPageController]).as('auth.login') // Alias

      // Dashboard router (redirects based on role)
      router.get('/dashboard', [ShowDashboardPageController]).use(middleware.auth()).as('dashboard')

      // Escola pages (school staff)
      router
        .group(() => {
          router.get('/', [ShowEscolaDashboardPageController]).as('dashboard')
          router.get('/periodos-letivos', [ShowPeriodosLetivosPageController]).as('periodosLetivos')
          router
            .get('/administrativo/periodos-letivos', [ShowPeriodosLetivosAdminPageController])
            .as('administrativo.periodosLetivos')
          router
            .get('/administrativo/periodos-letivos/novo-periodo-letivo', [
              ShowNovoPeriodoLetivoPageController,
            ])
            .as('administrativo.novoPeriodoLetivo')

          // Administrativo
          router
            .get('/administrativo/alunos', [ShowAlunosPageController])
            .as('administrativo.alunos')
          router
            .get('/administrativo/funcionarios', [ShowFuncionariosPageController])
            .as('administrativo.funcionarios')
          router
            .get('/administrativo/professores', [ShowProfessoresPageController])
            .as('administrativo.professores')
          router
            .get('/administrativo/matriculas', [ShowMatriculasPageController])
            .as('administrativo.matriculas')
          router
            .get('/administrativo/contratos', [ShowContratosPageController])
            .as('administrativo.contratos')
          router
            .get('/administrativo/contratos/:id/assinaturas', [
              ShowContratoAssinaturasPageController,
            ])
            .as('administrativo.contratos.assinaturas')
          router
            .get('/administrativo/contratos/:id/docuseal', [ShowContratoDocusealPageController])
            .as('administrativo.contratos.docuseal')
          router
            .get('/administrativo/bolsas', [ShowBolsasPageController])
            .as('administrativo.bolsas')
          router
            .get('/administrativo/parceiros', [ShowParceirosPageController])
            .as('administrativo.parceiros')
          router
            .get('/administrativo/materias', [ShowMateriasPageController])
            .as('administrativo.materias')
          router
            .get('/administrativo/folha-de-ponto', [ShowFolhaDePontoPageController])
            .as('administrativo.folhaDePonto')
          router
            .get('/administrativo/impressao', [ShowImpressaoPageController])
            .as('administrativo.impressao')

          // Pedagógico
          router.get('/pedagogico/turmas', [ShowTurmasPageController]).as('pedagogico.turmas')
          router.get('/pedagogico/grade', [ShowGradePageController]).as('pedagogico.grade')
          router
            .get('/pedagogico/ocorrencias', [ShowOcorrenciasPageController])
            .as('pedagogico.ocorrencias')

          // Cantina
          router.get('/cantina/itens', [ShowCantinaItensPageController]).as('cantina.itens')
          router
            .get('/cantina/cardapio', [ShowCantinaCardapioPageController])
            .as('cantina.cardapio')
          router.get('/cantina/pdv', [ShowCantinaPdvPageController]).as('cantina.pdv')
          router.get('/cantina/pedidos', [ShowCantinaPedidosPageController]).as('cantina.pedidos')
          router.get('/cantina/vendas', [ShowCantinaVendasPageController]).as('cantina.vendas')

          // Financeiro
          router
            .get('/financeiro/mensalidades', [ShowMensalidadesPageController])
            .as('financeiro.mensalidades')
          router
            .get('/financeiro/inadimplencia', [ShowInadimplenciaPageController])
            .as('financeiro.inadimplencia')

          // Gamificação
          router.get('/gamificacao', [ShowGamificacaoPageController]).as('gamificacao.index')
          router
            .get('/gamificacao/rankings', [ShowGamificacaoRankingsPageController])
            .as('gamificacao.rankings')
          router
            .get('/gamificacao/conquistas', [ShowGamificacaoConquistasPageController])
            .as('gamificacao.conquistas')
          router
            .get('/gamificacao/recompensas', [ShowGamificacaoRecompensasPageController])
            .as('gamificacao.recompensas')

          // Configurações
          router.get('/configuracoes', [ShowConfiguracoesPageController]).as('configuracoes')
        })
        .prefix('/escola')
        .use([middleware.auth(), middleware.requireSchool()])
        .as('escola')

      // Responsavel pages (parents/guardians)
      router
        .group(() => {
          router.get('/', [ShowResponsavelDashboardPageController]).as('dashboard')
          // More responsavel pages will be added here
        })
        .prefix('/responsavel')
        .use(middleware.auth())
        .as('responsavel')

      // Admin pages (platform admins)
      router
        .group(() => {
          router.get('/', [ShowAdminDashboardPageController]).as('dashboard')
          // More admin pages will be added here
        })
        .prefix('/admin')
        .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
        .as('admin')
    })
    .as('web')
}

// =============================================================================
// REGISTER ALL ROUTES
// =============================================================================

// Page Routes (Inertia)
registerPageRoutes()

// API Routes v1
router
  .group(() => {
    registerAuthApiRoutes()
    registerDashboardApiRoutes()
    registerAsaasWebhookApiRoutes()
    registerSchoolApiRoutes()
    registerUserApiRoutes()
    registerUserSchoolApiRoutes()
    registerUserSchoolGroupApiRoutes()
    registerStudentApiRoutes()
    registerResponsibleApiRoutes()
    registerResponsibleAddressApiRoutes()
    registerContractApiRoutes()
    registerContractDocumentApiRoutes()
    registerCourseApiRoutes()
    registerLevelApiRoutes()
    registerClassApiRoutes()
    registerSubjectApiRoutes()
    registerTeacherApiRoutes()
    registerExamApiRoutes()
    registerAttendanceApiRoutes()
    registerAssignmentApiRoutes()
    registerStudentPaymentApiRoutes()
    registerStudentBalanceTransactionApiRoutes()
    registerCanteenApiRoutes()
    registerCanteenReportApiRoutes()
    registerCanteenMonthlyTransferApiRoutes()
    registerCanteenItemApiRoutes()
    registerCanteenMealApiRoutes()
    registerCanteenMealReservationApiRoutes()
    registerCanteenPurchaseApiRoutes()
    registerAchievementApiRoutes()
    registerStoreItemApiRoutes()
    registerStoreOrderApiRoutes()
    registerStudentGamificationApiRoutes()
    registerLeaderboardApiRoutes()
    registerGamificationEventApiRoutes()
    registerScholarshipApiRoutes()
    registerSchoolPartnerApiRoutes()
    registerSchoolChainApiRoutes()
    registerSchoolGroupApiRoutes()
    registerAcademicPeriodApiRoutes()
    registerPrintRequestApiRoutes()
    registerPlatformSettingsApiRoutes()
    registerSubscriptionPlanApiRoutes()
    registerSubscriptionApiRoutes()
    registerSubscriptionInvoiceApiRoutes()
    registerSchoolUsageMetricsApiRoutes()
  })
  .prefix('/api/v1')
  .as('api.v1')
