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
const UploadSchoolLogoController = () =>
  import('#controllers/schools/upload_school_logo_controller')
const UpdateSchoolDirectorController = () =>
  import('#controllers/schools/update_school_director_controller')
const ListSchoolUsersController = () => import('#controllers/schools/list_school_users_controller')

// School Switcher
const GetSchoolSwitcherDataController = () =>
  import('#controllers/school_switcher/get_school_switcher_data_controller')
const ToggleSchoolSelectionController = () =>
  import('#controllers/school_switcher/toggle_school_selection_controller')
const ToggleSchoolGroupSelectionController = () =>
  import('#controllers/school_switcher/toggle_school_group_selection_controller')

// Auth
const LoginController = () => import('#controllers/auth/login')
const LogoutController = () => import('#controllers/auth/logout')
const SendCodeController = () => import('#controllers/auth/send_code')
const VerifyCodeController = () => import('#controllers/auth/verify_code')
const MeController = () => import('#controllers/auth/me')

// Users
const IndexUsersController = () => import('#controllers/users/index')
const SchoolEmployeesController = () => import('#controllers/users/school_employees')
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
const EnrollStudentController = () => import('#controllers/students/enroll_student_controller')
const FullUpdateStudentController = () =>
  import('#controllers/students/full_update_student_controller')

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
const GetCourseDashboardMetricsController = () =>
  import('#controllers/courses/get_course_dashboard_metrics_controller')
const GetCourseAlertsController = () => import('#controllers/courses/get_course_alerts_controller')
const GetCourseActivityFeedController = () =>
  import('#controllers/courses/get_course_activity_feed_controller')
const GetCourseClassesController = () =>
  import('#controllers/courses/get_course_classes_controller')

// Levels
const ListLevelsController = () => import('#controllers/levels/list_levels_controller')
const ShowLevelController = () => import('#controllers/levels/show_level_controller')
const CreateLevelController = () => import('#controllers/levels/create_level_controller')
const UpdateLevelController = () => import('#controllers/levels/update_level_controller')
const DeleteLevelController = () => import('#controllers/levels/delete_level_controller')

// Course Has Academic Periods
const CreateCourseHasAcademicPeriodController = () =>
  import('#controllers/course_has_academic_periods/create_course_has_academic_period_controller')

// Level Assignments
const CreateLevelAssignmentController = () =>
  import('#controllers/level_assignments/create_level_assignment_controller')

// Classes
const ListClassesController = () => import('#controllers/classes/list_classes_controller')
const ShowClassController = () => import('#controllers/classes/show_class_controller')
const ShowClassBySlugController = () => import('#controllers/classes/show_class_by_slug_controller')
const CreateClassController = () => import('#controllers/classes/create_class_controller')
const UpdateClassController = () => import('#controllers/classes/update_class_controller')
const DeleteClassController = () => import('#controllers/classes/delete_class_controller')
const UpdateClassWithTeachersController = () =>
  import('#controllers/classes/update_class_with_teachers_controller')
const CreateClassWithTeachersController = () =>
  import('#controllers/classes/create_class_with_teachers_controller')
const ListClassStudentsController = () =>
  import('#controllers/classes/list_class_students_controller')
const CountClassStudentsController = () =>
  import('#controllers/classes/count_class_students_controller')
const GetClassesForSidebarController = () =>
  import('#controllers/classes/get_classes_for_sidebar_controller')
const GetStudentStatusController = () =>
  import('#controllers/students/get_student_status_controller')

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

// Schedules
const GetClassScheduleController = () =>
  import('#controllers/schedules/get_class_schedule_controller')
const SaveClassScheduleController = () =>
  import('#controllers/schedules/save_class_schedule_controller')
const GenerateClassScheduleController = () =>
  import('#controllers/schedules/generate_class_schedule_controller')
const ValidateTeacherScheduleConflictController = () =>
  import('#controllers/schedules/validate_teacher_schedule_conflict_controller')

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
const UpdateTeacherSubjectsController = () =>
  import('#controllers/teachers/update_teacher_subjects_controller')
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
const BatchSaveExamGradesController = () =>
  import('#controllers/exams/batch_save_exam_grades_controller')
const UpdateExamGradeController = () => import('#controllers/exams/update_exam_grade_controller')

// Grades Analytics
const GetAcademicOverviewController = () =>
  import('#controllers/grades/get_academic_overview_controller')
const GetStudentsGradesController = () =>
  import('#controllers/grades/get_students_grades_controller')
const GetGradeDistributionController = () =>
  import('#controllers/grades/get_grade_distribution_controller')
const GetAtRiskStudentsController = () =>
  import('#controllers/grades/get_at_risk_students_controller')
const GetClassGradesBySubjectController = () =>
  import('#controllers/grades/get_class_grades_by_subject_controller')
const BatchSaveGradesController = () => import('#controllers/grades/batch_save_grades_controller')

// Analytics
const GetAttendanceOverviewController = () =>
  import('#controllers/analytics/get_attendance_overview_controller')
const GetAttendanceTrendsController = () =>
  import('#controllers/analytics/get_attendance_trends_controller')
const GetChronicAbsenteeismController = () =>
  import('#controllers/analytics/get_chronic_absenteeism_controller')
const GetCanteenOverviewController = () =>
  import('#controllers/analytics/get_canteen_overview_controller')
const GetCanteenTrendsController = () =>
  import('#controllers/analytics/get_canteen_trends_controller')
const GetCanteenTopItemsController = () =>
  import('#controllers/analytics/get_canteen_top_items_controller')
const GetPaymentsOverviewController = () =>
  import('#controllers/analytics/get_payments_overview_controller')
const GetEnrollmentsOverviewController = () =>
  import('#controllers/analytics/get_enrollments_overview_controller')
const GetEnrollmentFunnelStatsController = () =>
  import('#controllers/analytics/get_enrollment_funnel_stats_controller')
const GetEnrollmentTrendsController = () =>
  import('#controllers/analytics/get_enrollment_trends_controller')
const GetEnrollmentByLevelController = () =>
  import('#controllers/analytics/get_enrollment_by_level_controller')
const GetIncidentsOverviewController = () =>
  import('#controllers/analytics/get_incidents_overview_controller')
const GetGamificationOverviewController = () =>
  import('#controllers/analytics/get_gamification_overview_controller')
const GetHrOverviewController = () => import('#controllers/analytics/get_hr_overview_controller')

// Events
const ListEventsController = () => import('#controllers/events/list_events_controller')
const ShowEventController = () => import('#controllers/events/show_event_controller')
const CreateEventController = () => import('#controllers/events/create_event_controller')
const UpdateEventController = () => import('#controllers/events/update_event_controller')
const DeleteEventController = () => import('#controllers/events/delete_event_controller')
const PublishEventController = () => import('#controllers/events/publish_event_controller')
const CancelEventController = () => import('#controllers/events/cancel_event_controller')
const CompleteEventController = () => import('#controllers/events/complete_event_controller')

// Event Participants
const ListEventParticipantsController = () =>
  import('#controllers/event_participants/list_event_participants_controller')
const RegisterParticipantController = () =>
  import('#controllers/event_participants/register_participant_controller')
const UpdateParticipantStatusController = () =>
  import('#controllers/event_participants/update_participant_status_controller')
const CancelRegistrationController = () =>
  import('#controllers/event_participants/cancel_registration_controller')
const ConfirmAttendanceController = () =>
  import('#controllers/event_participants/confirm_attendance_controller')

// Parental Consents
const ListPendingConsentsController = () =>
  import('#controllers/parental_consents/list_pending_consents_controller')
const RespondConsentController = () =>
  import('#controllers/parental_consents/respond_consent_controller')
const ListConsentHistoryController = () =>
  import('#controllers/parental_consents/list_consent_history_controller')
const ListEventConsentsController = () =>
  import('#controllers/parental_consents/list_event_consents_controller')
const RequestConsentController = () =>
  import('#controllers/parental_consents/request_consent_controller')

// Online Enrollment
const GetSchoolEnrollmentInfoController = () =>
  import('#controllers/online-enrollment/get_school_enrollment_info_controller')

// Enrollment Management
const ListEnrollmentsController = () =>
  import('#controllers/enrollments/list_enrollments_controller')
const UpdateDocumentStatusController = () =>
  import('#controllers/enrollments/update_document_status_controller')
const CheckExistingStudentController = () =>
  import('#controllers/online-enrollment/check_existing_student_controller')
const FindScholarshipByCodeController = () =>
  import('#controllers/online-enrollment/find_scholarship_by_code_controller')
const FinishEnrollmentController = () =>
  import('#controllers/online-enrollment/finish_enrollment_controller')

// Notifications
const ListNotificationsController = () =>
  import('#controllers/notifications/list_notifications_controller')
const ShowNotificationController = () =>
  import('#controllers/notifications/show_notification_controller')
const MarkNotificationReadController = () =>
  import('#controllers/notifications/mark_notification_read_controller')
const MarkAllReadController = () => import('#controllers/notifications/mark_all_read_controller')
const DeleteNotificationController = () =>
  import('#controllers/notifications/delete_notification_controller')

// Notification Preferences
const ShowNotificationPreferencesController = () =>
  import('#controllers/notification_preferences/show_notification_preferences_controller')
const UpdateNotificationPreferencesController = () =>
  import('#controllers/notification_preferences/update_notification_preferences_controller')

// Posts
const ListPostsController = () => import('#controllers/posts/list_posts_controller')
const ShowPostController = () => import('#controllers/posts/show_post_controller')
const CreatePostController = () => import('#controllers/posts/create_post_controller')
const UpdatePostController = () => import('#controllers/posts/update_post_controller')
const DeletePostController = () => import('#controllers/posts/delete_post_controller')
const LikePostController = () => import('#controllers/posts/like_post_controller')
const UnlikePostController = () => import('#controllers/posts/unlike_post_controller')

// Comments
const ListPostCommentsController = () =>
  import('#controllers/comments/list_post_comments_controller')
const CreateCommentController = () => import('#controllers/comments/create_comment_controller')
const UpdateCommentController = () => import('#controllers/comments/update_comment_controller')
const DeleteCommentController = () => import('#controllers/comments/delete_comment_controller')
const LikeCommentController = () => import('#controllers/comments/like_comment_controller')

// Attendance
const ListAttendanceController = () => import('#controllers/attendance/list_attendance_controller')
const ShowAttendanceController = () => import('#controllers/attendance/show_attendance_controller')
const CreateAttendanceController = () =>
  import('#controllers/attendance/create_attendance_controller')
const BatchCreateAttendanceController = () =>
  import('#controllers/attendance/batch_create_attendance_controller')
const GetAttendanceAvailableDatesController = () =>
  import('#controllers/attendance/get_attendance_available_dates_controller')
const UpdateAttendanceController = () =>
  import('#controllers/attendance/update_attendance_controller')
const GetStudentAttendanceController = () =>
  import('#controllers/attendance/get_student_attendance_controller')
const GetClassStudentsAttendanceController = () =>
  import('#controllers/attendance/get_class_students_attendance_controller')

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

// Purchase Requests
const ListPurchaseRequestsController = () =>
  import('#controllers/purchase_requests/list_purchase_requests_controller')
const ShowPurchaseRequestController = () =>
  import('#controllers/purchase_requests/show_purchase_request_controller')
const CreatePurchaseRequestController = () =>
  import('#controllers/purchase_requests/create_purchase_request_controller')
const UpdatePurchaseRequestController = () =>
  import('#controllers/purchase_requests/update_purchase_request_controller')
const DeletePurchaseRequestController = () =>
  import('#controllers/purchase_requests/delete_purchase_request_controller')
const ApprovePurchaseRequestController = () =>
  import('#controllers/purchase_requests/approve_purchase_request_controller')
const RejectPurchaseRequestController = () =>
  import('#controllers/purchase_requests/reject_purchase_request_controller')
const MarkAsBoughtController = () =>
  import('#controllers/purchase_requests/mark_as_bought_controller')
const MarkAsArrivedController = () =>
  import('#controllers/purchase_requests/mark_as_arrived_controller')

// Insurance
const GetInsuranceConfigController = () =>
  import('#controllers/insurance/get_insurance_config_controller')
const UpdateSchoolInsuranceController = () =>
  import('#controllers/insurance/update_school_insurance_controller')
const UpdateSchoolChainInsuranceController = () =>
  import('#controllers/insurance/update_school_chain_insurance_controller')
const ResetSchoolInsuranceController = () =>
  import('#controllers/insurance/reset_school_insurance_controller')
const ListInsuranceClaimsController = () =>
  import('#controllers/insurance/list_insurance_claims_controller')
const ApproveInsuranceClaimController = () =>
  import('#controllers/insurance/approve_insurance_claim_controller')
const RejectInsuranceClaimController = () =>
  import('#controllers/insurance/reject_insurance_claim_controller')
const MarkClaimPaidController = () => import('#controllers/insurance/mark_claim_paid_controller')
const ListInsuranceBillingsController = () =>
  import('#controllers/insurance/list_insurance_billings_controller')
const GetBillingDetailsController = () =>
  import('#controllers/insurance/get_billing_details_controller')
const GetInsuranceStatsController = () =>
  import('#controllers/insurance/get_insurance_stats_controller')
const GetDefaultRateBySchoolController = () =>
  import('#controllers/insurance/get_default_rate_by_school_controller')
const GetSchoolsWithoutInsuranceController = () =>
  import('#controllers/insurance/get_schools_without_insurance_controller')
const GetSchoolInsuranceStatsController = () =>
  import('#controllers/insurance/get_school_insurance_stats_controller')
const GetSchoolInsuranceBillingsController = () =>
  import('#controllers/insurance/get_school_insurance_billings_controller')
const GetSchoolInsuranceClaimsController = () =>
  import('#controllers/insurance/get_school_insurance_claims_controller')

// Impersonation
const SetImpersonationController = () => import('#controllers/admin/set_impersonation_controller')
const ClearImpersonationController = () =>
  import('#controllers/admin/clear_impersonation_controller')
const GetImpersonationStatusController = () =>
  import('#controllers/admin/get_impersonation_status_controller')

// Admin - Onboarding
const CreateSchoolOnboardingController = () =>
  import('#controllers/admin/create_school_onboarding_controller')
const GetImpersonationConfigController = () =>
  import('#controllers/admin/get_impersonation_config_controller')

// =============================================================================
// API ROUTE FUNCTIONS
// =============================================================================

function registerAuthApiRoutes() {
  // Public
  router
    .group(() => {
      router.post('/login', [LoginController]).as('auth.login')
      router.post('/send-code', [SendCodeController]).as('auth.sendCode')
      router.post('/verify-code', [VerifyCodeController]).as('auth.verifyCode')
    })
    .prefix('/auth')

  // Protected
  router
    .group(() => {
      router.post('/logout', [LogoutController]).as('auth.logout')
      router.get('/me', [MeController]).as('auth.me')
    })
    .prefix('/auth')
    .use(middleware.auth())
}

function registerSchoolApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexSchoolsController]).as('schools.index')
      router.post('/', [StoreSchoolController]).as('schools.store')
      router.get('/slug/:slug', [ShowSchoolBySlugController]).as('schools.showBySlug')
      router.get('/:id', [ShowSchoolController]).as('schools.show')
      router.put('/:id', [UpdateSchoolController]).as('schools.update')
      router.delete('/:id', [DestroySchoolController]).as('schools.destroy')
      router.post('/:id/logo', [UploadSchoolLogoController]).as('schools.uploadLogo')
      router.get('/:id/users', [ListSchoolUsersController]).as('schools.users')
      router.put('/:id/director', [UpdateSchoolDirectorController]).as('schools.updateDirector')
    })
    .prefix('/schools')
}

function registerUserApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexUsersController]).as('users.index')
      router.get('/school-employees', [SchoolEmployeesController]).as('users.schoolEmployees')
      router.post('/', [StoreUserController]).as('users.store')
      router.get('/:id', [ShowUserController]).as('users.show')
      router.put('/:id', [UpdateUserController]).as('users.update')
      router.delete('/:id', [DestroyUserController]).as('users.destroy')

      // User Canteen Purchases
      router
        .get('/:userId/canteen-purchases', [ListPurchasesByUserController])
        .as('users.canteenPurchases')
    })
    .prefix('/users')
    .use([middleware.auth(), middleware.impersonation()])
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
      router.get('/', [ListUserSchoolsController]).as('userSchools.listUserSchools')
      router.post('/', [CreateUserSchoolController]).as('userSchools.createUserSchool')
      router.put('/:id', [UpdateUserSchoolController]).as('userSchools.updateUserSchool')
      router.delete('/:id', [DeleteUserSchoolController]).as('userSchools.deleteUserSchool')
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
      router.get('/', [ListUserSchoolGroupsController]).as('userSchoolGroups.listUserSchoolGroups')
      router
        .post('/', [CreateUserSchoolGroupController])
        .as('userSchoolGroups.createUserSchoolGroup')
      router
        .delete('/:id', [DeleteUserSchoolGroupController])
        .as('userSchoolGroups.deleteUserSchoolGroup')
    })
    .prefix('/user-school-groups')
    .use(middleware.auth())
}

function registerSchoolSwitcherApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetSchoolSwitcherDataController]).as('schoolSwitcher.getData')
      router
        .post('/toggle-school', [ToggleSchoolSelectionController])
        .as('schoolSwitcher.toggleSchool')
      router
        .post('/toggle-group', [ToggleSchoolGroupSelectionController])
        .as('schoolSwitcher.toggleGroup')
    })
    .prefix('/school-switcher')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerStudentApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexStudentsController]).as('students.index')
      router.post('/', [StoreStudentController]).as('students.store')
      router.post('/enroll', [EnrollStudentController]).as('students.enroll')
      router.get('/:id', [ShowStudentController]).as('students.show')
      router.put('/:id', [UpdateStudentController]).as('students.update')
      router.put('/:id/full', [FullUpdateStudentController]).as('students.fullUpdate')
      router.delete('/:id', [DestroyStudentController]).as('students.destroy')
      router
        .get('/:studentId/attendance', [GetStudentAttendanceController])
        .as('students.attendance')

      // Student Payments
      router
        .get('/:studentId/payments', [ListStudentPaymentsByStudentController])
        .as('students.payments')

      // Student Balance
      router.get('/:studentId/balance', [GetStudentBalanceController]).as('students.balance')
      router
        .get('/:studentId/balance-transactions', [ListStudentBalanceByStudentController])
        .as('students.balanceTransactions')
    })
    .prefix('/students')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerResponsibleApiRoutes() {
  router
    .group(() => {
      router
        .get('/students/:studentId/responsibles', [ListStudentResponsiblesController])
        .as('responsibles.listByStudent')
      router.post('/responsibles', [AssignResponsibleController]).as('responsibles.assign')
      router
        .put('/responsibles/:id', [UpdateResponsibleAssignmentController])
        .as('responsibles.updateAssignment')
      router.delete('/responsibles/:id', [RemoveResponsibleController]).as('responsibles.remove')
    })
    .use(middleware.auth())
}

function registerResponsibleAddressApiRoutes() {
  router
    .group(() => {
      router
        .get('/responsible-addresses/:responsibleId', [ShowResponsibleAddressController])
        .as('responsibleAddresses.show')
      router
        .post('/responsible-addresses', [CreateResponsibleAddressController])
        .as('responsibleAddresses.create')
    })
    .use(middleware.auth())
}

function registerContractApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListContractsController]).as('contracts.index')
      router.post('/', [CreateContractController]).as('contracts.store')
      router.get('/:id', [ShowContractController]).as('contracts.show')
      router.put('/:id', [UpdateContractController]).as('contracts.update')
      router.delete('/:id', [DeleteContractController]).as('contracts.destroy')

      router
        .get('/:contractId/signature-stats', [GetSignatureStatsController])
        .as('contracts.getSignatureStats')

      router
        .get('/:contractId/docuseal-template', [GetDocusealTemplateController])
        .as('contracts.getDocusealTemplate')
      router
        .post('/:contractId/docuseal-template', [UploadDocusealTemplateController])
        .as('contracts.uploadDocusealTemplate')
      router
        .delete('/:contractId/docuseal-template', [DeleteDocusealTemplateController])
        .as('contracts.deleteDocusealTemplate')

      // Payment Days (nested)
      router
        .get('/:contractId/payment-days', [ListContractPaymentDaysController])
        .as('contracts.paymentDays.index')
      router
        .post('/:contractId/payment-days', [AddContractPaymentDayController])
        .as('contracts.paymentDays.store')
      router
        .delete('/:contractId/payment-days/:id', [RemoveContractPaymentDayController])
        .as('contracts.paymentDays.destroy')

      // Interest Config (nested)
      router
        .get('/:contractId/interest-config', [ShowContractInterestConfigController])
        .as('contracts.interestConfig.show')
      router
        .put('/:contractId/interest-config', [UpdateContractInterestConfigController])
        .as('contracts.interestConfig.update')

      // Early Discounts (nested)
      router
        .get('/:contractId/early-discounts', [ListContractEarlyDiscountsController])
        .as('contracts.earlyDiscounts.index')
      router
        .post('/:contractId/early-discounts', [AddContractEarlyDiscountController])
        .as('contracts.earlyDiscounts.store')
      router
        .put('/:contractId/early-discounts/:id', [UpdateContractEarlyDiscountController])
        .as('contracts.earlyDiscounts.update')
      router
        .delete('/:contractId/early-discounts/:id', [
          RemoveContractEarlyDiscountController,
          'handle',
        ])
        .as('contracts.earlyDiscounts.destroy')
    })
    .prefix('/contracts')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerContractDocumentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListContractDocumentsController]).as('contractDocuments.index')
      router.post('/', [CreateContractDocumentController]).as('contractDocuments.store')
    })
    .prefix('/contract-documents')
    .use(middleware.auth())
}

function registerCourseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCoursesController]).as('courses.index')
      router.post('/', [CreateCourseController]).as('courses.store')
      router.get('/:id', [ShowCourseController]).as('courses.show')
      router.put('/:id', [UpdateCourseController]).as('courses.update')
      router.delete('/:id', [DeleteCourseController]).as('courses.destroy')

      // Dashboard endpoints for course overview
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/metrics', [
          GetCourseDashboardMetricsController,
          'handle',
        ])
        .as('courses.dashboard.metrics')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/alerts', [
          GetCourseAlertsController,
          'handle',
        ])
        .as('courses.dashboard.alerts')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/activity-feed', [
          GetCourseActivityFeedController,
          'handle',
        ])
        .as('courses.dashboard.activityFeed')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/classes', [
          GetCourseClassesController,
          'handle',
        ])
        .as('courses.classes')
    })
    .prefix('/courses')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerLevelApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListLevelsController]).as('levels.index')
      router.post('/', [CreateLevelController]).as('levels.store')
      router.get('/:id', [ShowLevelController]).as('levels.show')
      router.put('/:id', [UpdateLevelController]).as('levels.update')
      router.delete('/:id', [DeleteLevelController]).as('levels.destroy')
    })
    .prefix('/levels')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerCourseHasAcademicPeriodApiRoutes() {
  router
    .group(() => {
      router
        .post('/', [CreateCourseHasAcademicPeriodController])
        .as('courseHasAcademicPeriods.store')
    })
    .prefix('/course-has-academic-periods')
    .use(middleware.auth())
}

function registerLevelAssignmentApiRoutes() {
  router
    .group(() => {
      router.post('/', [CreateLevelAssignmentController]).as('levelAssignments.store')
    })
    .prefix('/level-assignments')
    .use(middleware.auth())
}

function registerClassApiRoutes() {
  router
    .group(() => {
      router
        .get('/sidebar', [GetClassesForSidebarController])
        .as('classes.sidebar')
        .use(middleware.impersonation())
      router.get('/', [ListClassesController]).as('classes.index')
      router.post('/', [CreateClassController]).as('classes.store')
      router
        .post('/with-teachers', [CreateClassWithTeachersController])
        .as('classes.storeWithTeachers')
      router.get('/slug/:slug', [ShowClassBySlugController]).as('classes.showBySlug')
      router.get('/:id', [ShowClassController]).as('classes.show')
      router.put('/:id', [UpdateClassController]).as('classes.update')
      router
        .put('/:id/teachers', [UpdateClassWithTeachersController])
        .as('classes.updateWithTeachers')
      router.delete('/:id', [DeleteClassController]).as('classes.destroy')
      router.get('/:id/students', [ListClassStudentsController]).as('classes.students')
      router.get('/:id/students/count', [CountClassStudentsController]).as('classes.studentsCount')
      router.get('/:classId/subjects', [ListSubjectsForClassController]).as('classes.subjects')
      router.get('/:id/student-status', [GetStudentStatusController]).as('classes.studentStatus')
    })
    .prefix('/classes')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerSubjectApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubjectsController]).as('subjects.index')
      router.post('/', [CreateSubjectController]).as('subjects.store')
      router.get('/slug/:slug', [ShowSubjectBySlugController]).as('subjects.showBySlug')
      router.get('/:id', [ShowSubjectController]).as('subjects.show')
      router.put('/:id', [UpdateSubjectController]).as('subjects.update')
      router.delete('/:id', [DeleteSubjectController]).as('subjects.destroy')
    })
    .prefix('/subjects')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerScheduleApiRoutes() {
  router
    .group(() => {
      router.get('/class/:classId', [GetClassScheduleController]).as('schedules.getClassSchedule')
      router
        .post('/class/:classId', [SaveClassScheduleController])
        .as('schedules.saveClassSchedule')
      router
        .post('/class/:classId/generate', [GenerateClassScheduleController])
        .as('schedules.generateClassSchedule')
      router
        .post('/validate-conflict', [ValidateTeacherScheduleConflictController])
        .as('schedules.validateConflict')
    })
    .prefix('/schedules')
    .use(middleware.auth())
}

function registerTeacherApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListTeachersController]).as('teachers.listTeachers')
      router.post('/', [CreateTeacherController]).as('teachers.createTeacher')

      // Rotas específicas ANTES das rotas com parâmetros /:id
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

      // Rotas com parâmetros /:id
      router.get('/:id', [ShowTeacherController]).as('teachers.showTeacher')
      router.put('/:id', [UpdateTeacherController]).as('teachers.updateTeacher')
      router.delete('/:id', [DeleteTeacherController]).as('teachers.deleteTeacher')
      router.get('/:id/classes', [ListTeacherClassesController]).as('teachers.listTeacherClasses')
      router
        .get('/:id/subjects', [ListTeacherSubjectsController])
        .as('teachers.listTeacherSubjects')
      router
        .put('/:id/subjects', [UpdateTeacherSubjectsController])
        .as('teachers.updateTeacherSubjects')
      router.post('/:id/classes', [AssignTeacherToClassController]).as('teachers.assignClass')
      router
        .delete('/:id/classes/:classId', [RemoveTeacherFromClassController])
        .as('teachers.removeClass')
    })
    .prefix('/teachers')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerExamApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListExamsController]).as('exams.index')
      router.post('/', [CreateExamController]).as('exams.store')
      router.get('/:id', [ShowExamController]).as('exams.show')
      router.put('/:id', [UpdateExamController]).as('exams.update')
      router.delete('/:id', [DeleteExamController]).as('exams.destroy')
      router.post('/:id/grades/batch', [BatchSaveExamGradesController]).as('exams.batchSaveGrades')
      router.get('/:id/grades', [ListExamGradesController]).as('exams.grades')
      router.post('/:id/grades', [SaveExamGradeController]).as('exams.saveGrade')
      router.put('/:id/grades/:gradeId', [UpdateExamGradeController]).as('exams.updateGrade')
    })
    .prefix('/exams')
    .use(middleware.auth())
}

function registerGradesApiRoutes() {
  router
    .group(() => {
      router
        .get('/academic-overview', [GetAcademicOverviewController])
        .as('grades.academicOverview')
      router.get('/students', [GetStudentsGradesController]).as('grades.students')
      router.get('/distribution', [GetGradeDistributionController]).as('grades.distribution')
      router.get('/at-risk', [GetAtRiskStudentsController]).as('grades.atRisk')
      router
        .get('/class/:classId/subject/:subjectId', [GetClassGradesBySubjectController])
        .as('grades.classSubject')
      router.post('/batch', [BatchSaveGradesController]).as('grades.batchSave')
    })
    .prefix('/grades')
    .use(middleware.auth())
}

function registerAnalyticsApiRoutes() {
  router
    .group(() => {
      // Attendance Analytics
      router
        .get('/attendance/overview', [GetAttendanceOverviewController])
        .as('analytics.attendance.overview')
      router
        .get('/attendance/trends', [GetAttendanceTrendsController])
        .as('analytics.attendance.trends')
      router
        .get('/attendance/chronic', [GetChronicAbsenteeismController])
        .as('analytics.attendance.chronic')

      // Canteen Analytics
      router
        .get('/canteen/overview', [GetCanteenOverviewController])
        .as('analytics.canteen.overview')
      router.get('/canteen/trends', [GetCanteenTrendsController]).as('analytics.canteen.trends')
      router
        .get('/canteen/top-items', [GetCanteenTopItemsController])
        .as('analytics.canteen.topItems')

      // Payments Analytics
      router
        .get('/payments/overview', [GetPaymentsOverviewController])
        .as('analytics.payments.overview')

      // Enrollments Analytics
      router
        .get('/enrollments/overview', [GetEnrollmentsOverviewController])
        .as('analytics.enrollments.overview')
      router
        .get('/enrollments/funnel', [GetEnrollmentFunnelStatsController])
        .as('analytics.enrollments.funnel')
      router
        .get('/enrollments/trends', [GetEnrollmentTrendsController])
        .as('analytics.enrollments.trends')
      router
        .get('/enrollments/by-level', [GetEnrollmentByLevelController])
        .as('analytics.enrollments.byLevel')

      // Incidents Analytics
      router
        .get('/incidents/overview', [GetIncidentsOverviewController])
        .as('analytics.incidents.overview')

      // Gamification Analytics
      router
        .get('/gamification/overview', [GetGamificationOverviewController])
        .as('analytics.gamification.overview')

      // HR Analytics
      router.get('/hr/overview', [GetHrOverviewController]).as('analytics.hr.overview')
    })
    .prefix('/analytics')
    .use(middleware.auth())
}

function registerEventApiRoutes() {
  router
    .group(() => {
      // CRUD
      router.get('/', [ListEventsController]).as('events.index')
      router.post('/', [CreateEventController]).as('events.store')
      router.get('/:id', [ShowEventController]).as('events.show')
      router.put('/:id', [UpdateEventController]).as('events.update')
      router.delete('/:id', [DeleteEventController]).as('events.destroy')

      // Status actions
      router.post('/:id/publish', [PublishEventController]).as('events.publish')
      router.post('/:id/cancel', [CancelEventController]).as('events.cancel')
      router.post('/:id/complete', [CompleteEventController]).as('events.complete')

      // Participants
      router
        .get('/:eventId/participants', [ListEventParticipantsController])
        .as('events.participants.index')
      router
        .post('/:eventId/participants', [RegisterParticipantController])
        .as('events.participants.register')
      router
        .put('/:eventId/participants/:participantId', [UpdateParticipantStatusController])
        .as('events.participants.updateStatus')
      router
        .delete('/:eventId/participants/:participantId', [CancelRegistrationController])
        .as('events.participants.cancel')
      router
        .post('/:eventId/participants/:participantId/confirm', [
          ConfirmAttendanceController,
          'handle',
        ])
        .as('events.participants.confirmAttendance')

      // Parental Consents (event-side)
      router.get('/:eventId/consents', [ListEventConsentsController]).as('events.consents.index')
      router.post('/:eventId/consents', [RequestConsentController]).as('events.consents.request')
    })
    .prefix('/events')
    .use([middleware.auth(), middleware.impersonation()])
}

function registerParentalConsentApiRoutes() {
  router
    .group(() => {
      // Responsável endpoints
      router.get('/pending', [ListPendingConsentsController]).as('consents.pending')
      router.get('/history', [ListConsentHistoryController]).as('consents.history')
      router.post('/:id/respond', [RespondConsentController]).as('consents.respond')
    })
    .prefix('/parental-consents')
    .use(middleware.auth())
}

function registerOnlineEnrollmentApiRoutes() {
  router
    .group(() => {
      // Public routes - no auth required
      router
        .get('/:schoolSlug/:academicPeriodSlug/:courseSlug/info', [
          GetSchoolEnrollmentInfoController,
          'handle',
        ])
        .as('enrollment.info')
      router
        .post('/check-existing', [CheckExistingStudentController])
        .as('enrollment.checkExisting')
      router
        .post('/find-scholarship', [FindScholarshipByCodeController])
        .as('enrollment.findScholarship')
      router.post('/finish', [FinishEnrollmentController]).as('enrollment.finish')
    })
    .prefix('/online-enrollment')
}

function registerEnrollmentManagementApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListEnrollmentsController]).as('enrollments.index')
      router
        .put('/documents/:id/status', [UpdateDocumentStatusController])
        .as('enrollments.documents.updateStatus')
    })
    .prefix('/enrollments')
    .use(middleware.auth())
}

function registerAttendanceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAttendanceController]).as('attendance.index')
      router.post('/', [CreateAttendanceController]).as('attendance.store')
      router.post('/batch', [BatchCreateAttendanceController]).as('attendance.batch')
      router
        .get('/class/:classId/students', [GetClassStudentsAttendanceController])
        .as('attendance.classStudents')
      router
        .get('/available-dates', [GetAttendanceAvailableDatesController])
        .as('attendance.availableDates')
      router.get('/:id', [ShowAttendanceController]).as('attendance.show')
      router.put('/:id', [UpdateAttendanceController]).as('attendance.update')
    })
    .prefix('/attendance')
    .use(middleware.auth())
}

function registerNotificationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListNotificationsController]).as('notifications.index')
      router.get('/:id', [ShowNotificationController]).as('notifications.show')
      router.post('/:id/read', [MarkNotificationReadController]).as('notifications.markRead')
      router.post('/read-all', [MarkAllReadController]).as('notifications.markAllRead')
      router.delete('/:id', [DeleteNotificationController]).as('notifications.destroy')
    })
    .prefix('/notifications')
    .use(middleware.auth())
}

function registerNotificationPreferenceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ShowNotificationPreferencesController]).as('notificationPreferences.show')
      router
        .put('/', [UpdateNotificationPreferencesController])
        .as('notificationPreferences.update')
    })
    .prefix('/notification-preferences')
    .use(middleware.auth())
}

function registerPostApiRoutes() {
  router
    .group(() => {
      // CRUD
      router.get('/', [ListPostsController]).as('posts.index')
      router.post('/', [CreatePostController]).as('posts.store')
      router.get('/:id', [ShowPostController]).as('posts.show')
      router.put('/:id', [UpdatePostController]).as('posts.update')
      router.delete('/:id', [DeletePostController]).as('posts.destroy')

      // Likes
      router.post('/:id/like', [LikePostController]).as('posts.like')
      router.delete('/:id/like', [UnlikePostController]).as('posts.unlike')

      // Comments (nested under posts)
      router.get('/:postId/comments', [ListPostCommentsController]).as('posts.comments.index')
      router.post('/:postId/comments', [CreateCommentController]).as('posts.comments.store')
    })
    .prefix('/posts')
    .use(middleware.auth())
}

function registerCommentApiRoutes() {
  router
    .group(() => {
      router.put('/:id', [UpdateCommentController]).as('comments.update')
      router.delete('/:id', [DeleteCommentController]).as('comments.destroy')
      router.post('/:id/like', [LikeCommentController]).as('comments.like')
    })
    .prefix('/comments')
    .use(middleware.auth())
}

function registerAssignmentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAssignmentsController]).as('assignments.index')
      router.post('/', [CreateAssignmentController]).as('assignments.store')
      router.get('/:id', [ShowAssignmentController]).as('assignments.show')
      router.put('/:id', [UpdateAssignmentController]).as('assignments.update')
      router.delete('/:id', [DeleteAssignmentController]).as('assignments.destroy')
      router
        .get('/:id/submissions', [ListAssignmentSubmissionsController])
        .as('assignments.submissions')
      router.post('/:id/submissions', [SubmitAssignmentController]).as('assignments.submit')
      router
        .put('/:id/submissions/:submissionId', [GradeSubmissionController])
        .as('assignments.grade')
    })
    .prefix('/assignments')
    .use(middleware.auth())
}

function registerStudentPaymentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStudentPaymentsController]).as('studentPayments.index')
      router.post('/', [CreateStudentPaymentController]).as('studentPayments.store')
      router.get('/:id', [ShowStudentPaymentController]).as('studentPayments.show')
      router.put('/:id', [UpdateStudentPaymentController]).as('studentPayments.update')
      router.post('/:id/cancel', [CancelStudentPaymentController]).as('studentPayments.cancel')
      router.post('/:id/mark-paid', [MarkPaymentAsPaidController]).as('studentPayments.markPaid')
      router
        .post('/:id/asaas-charge', [CreateStudentPaymentAsaasChargeController])
        .as('studentPayments.asaasCharge')
      router
        .post('/:id/send-boleto', [SendStudentPaymentBoletoEmailController])
        .as('studentPayments.sendBoleto')
      router.get('/:id/boleto', [GetStudentPaymentBoletoController]).as('studentPayments.getBoleto')
    })
    .prefix('/student-payments')
    .use(middleware.auth())
}

function registerStudentBalanceTransactionApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListStudentBalanceTransactionsController])
        .as('studentBalanceTransactions.index')
      router
        .post('/', [CreateStudentBalanceTransactionController])
        .as('studentBalanceTransactions.store')
      router
        .get('/:id', [ShowStudentBalanceTransactionController])
        .as('studentBalanceTransactions.show')
    })
    .prefix('/student-balance-transactions')
    .use(middleware.auth())
}

function registerAsaasWebhookApiRoutes() {
  router
    .group(() => {
      router.post('/webhook', [AsaasWebhookController]).as('asaas.webhook')
    })
    .prefix('/asaas')
}

function registerCanteenApiRoutes() {
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
    .use(middleware.auth())
}

function registerCanteenReportApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetCanteenReportController]).as('canteenReports.summary')
    })
    .prefix('/canteen-reports')
    .use(middleware.auth())
}

function registerCanteenMonthlyTransferApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMonthlyTransfersController]).as('canteenMonthlyTransfers.index')
      router.post('/', [CreateCanteenMonthlyTransferController]).as('canteenMonthlyTransfers.store')
      router.get('/:id', [ShowCanteenMonthlyTransferController]).as('canteenMonthlyTransfers.show')
      router
        .put('/:id/status', [UpdateCanteenMonthlyTransferStatusController])
        .as('canteenMonthlyTransfers.updateStatus')
    })
    .prefix('/canteen-monthly-transfers')
    .use(middleware.auth())
}

function registerCanteenItemApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenItemsController]).as('canteenItems.index')
      router.post('/', [CreateCanteenItemController]).as('canteenItems.store')
      router.get('/:id', [ShowCanteenItemController]).as('canteenItems.show')
      router.put('/:id', [UpdateCanteenItemController]).as('canteenItems.update')
      router.delete('/:id', [DeleteCanteenItemController]).as('canteenItems.destroy')
      router
        .get('/:id/toggle-active', [ToggleCanteenItemActiveController])
        .as('canteenItems.toggleActive')
    })
    .prefix('/canteen-items')
    .use(middleware.auth())
}

function registerCanteenMealApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealsController]).as('canteenMeals.index')
      router.post('/', [CreateCanteenMealController]).as('canteenMeals.store')
      router.get('/:id', [ShowCanteenMealController]).as('canteenMeals.show')
      router.put('/:id', [UpdateCanteenMealController]).as('canteenMeals.update')
      router.delete('/:id', [DeleteCanteenMealController]).as('canteenMeals.destroy')
    })
    .prefix('/canteen-meals')
    .use(middleware.auth())
}

function registerCanteenMealReservationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenMealReservationsController]).as('canteenMealReservations.index')
      router.post('/', [CreateCanteenMealReservationController]).as('canteenMealReservations.store')
      router.get('/:id', [ShowCanteenMealReservationController]).as('canteenMealReservations.show')
      router
        .put('/:id/status', [UpdateCanteenMealReservationStatusController])
        .as('canteenMealReservations.updateStatus')
      router
        .delete('/:id', [DeleteCanteenMealReservationController])
        .as('canteenMealReservations.cancel')
    })
    .prefix('/canteen-meal-reservations')
    .use(middleware.auth())
}

function registerCanteenPurchaseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCanteenPurchasesController]).as('canteenPurchases.index')
      router.post('/', [CreateCanteenPurchaseController]).as('canteenPurchases.store')
      router.get('/:id', [ShowCanteenPurchaseController]).as('canteenPurchases.show')
      router
        .put('/:id/status', [UpdateCanteenPurchaseStatusController])
        .as('canteenPurchases.updateStatus')
      router.post('/:id/cancel', [CancelCanteenPurchaseController]).as('canteenPurchases.cancel')
    })
    .prefix('/canteen-purchases')
    .use(middleware.auth())
}

function registerAchievementApiRoutes() {
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

function registerStoreItemApiRoutes() {
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

function registerStoreOrderApiRoutes() {
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

function registerStudentGamificationApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStudentGamificationsController]).as('studentGamifications.index')
      router.post('/', [CreateStudentGamificationController]).as('studentGamifications.store')
      router.get('/:id', [ShowStudentGamificationController]).as('studentGamifications.show')
      router.post('/add-points', [AddPointsController]).as('studentGamifications.addPoints')
      router.get('/ranking', [GetPointsRankingController]).as('studentGamifications.ranking')
    })
    .prefix('/student-gamifications')
    .use(middleware.auth())

  // Student stats route (nested under students)
  router
    .group(() => {
      router
        .get('/:studentId/gamification/stats', [GetStudentStatsController])
        .as('students.gamificationStats')
    })
    .prefix('/students')
    .use(middleware.auth())
}

function registerLeaderboardApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListLeaderboardsController]).as('leaderboards.index')
      router.post('/', [CreateLeaderboardController]).as('leaderboards.store')
      router.get('/:id', [ShowLeaderboardController]).as('leaderboards.show')
      router.put('/:id', [UpdateLeaderboardController]).as('leaderboards.update')
      router.delete('/:id', [DeleteLeaderboardController]).as('leaderboards.destroy')
      router.get('/:id/entries', [ListLeaderboardEntriesController]).as('leaderboards.entries')
    })
    .prefix('/leaderboards')
    .use(middleware.auth())
}

function registerGamificationEventApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListGamificationEventsController]).as('gamificationEvents.index')
      router.post('/', [CreateGamificationEventController]).as('gamificationEvents.store')
      router.get('/:id', [ShowGamificationEventController]).as('gamificationEvents.show')
      router.post('/:id/retry', [RetryGamificationEventController]).as('gamificationEvents.retry')
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
      router.get('/', [ListScholarshipsController]).as('scholarships.listScholarships')
      router.post('/', [CreateScholarshipController]).as('scholarships.createScholarship')
      router.get('/:id', [ShowScholarshipController]).as('scholarships.showScholarship')
      router.put('/:id', [UpdateScholarshipController]).as('scholarships.updateScholarship')
      router
        .patch('/:id/toggle-active', [ToggleScholarshipActiveController])
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
      router.get('/', [ListSchoolPartnersController]).as('schoolPartners.listSchoolPartners')
      router.post('/', [CreateSchoolPartnerController]).as('schoolPartners.createSchoolPartner')
      router.get('/:id', [ShowSchoolPartnerController]).as('schoolPartners.showSchoolPartner')
      router.put('/:id', [UpdateSchoolPartnerController]).as('schoolPartners.updateSchoolPartner')
      router
        .patch('/:id/toggle-active', [ToggleSchoolPartnerActiveController])
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
      router.get('/', [ListSchoolChainsController]).as('schoolChains.listSchoolChains')
      router.post('/', [CreateSchoolChainController]).as('schoolChains.createSchoolChain')
      router.get('/:id', [ShowSchoolChainController]).as('schoolChains.showSchoolChain')
      router.put('/:id', [UpdateSchoolChainController]).as('schoolChains.updateSchoolChain')
      router.delete('/:id', [DeleteSchoolChainController]).as('schoolChains.deleteSchoolChain')
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
      router.get('/', [ListSchoolGroupsController]).as('schoolGroups.listSchoolGroups')
      router.post('/', [CreateSchoolGroupController]).as('schoolGroups.createSchoolGroup')
      router.get('/:id', [ShowSchoolGroupController]).as('schoolGroups.showSchoolGroup')
      router.put('/:id', [UpdateSchoolGroupController]).as('schoolGroups.updateSchoolGroup')
      router.delete('/:id', [DeleteSchoolGroupController]).as('schoolGroups.deleteSchoolGroup')
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
  const ShowAcademicPeriodBySlugController = () =>
    import('#controllers/academic_periods/show_academic_period_by_slug_controller')
  const UpdateAcademicPeriodController = () =>
    import('#controllers/academic_periods/update_academic_period_controller')
  const DeleteAcademicPeriodController = () =>
    import('#controllers/academic_periods/delete_academic_period_controller')
  const ListAcademicPeriodCoursesController = () =>
    import('#controllers/academic_periods/list_academic_period_courses_controller')
  const UpdateAcademicPeriodCoursesController = () =>
    import('#controllers/academic_periods/update_academic_period_courses_controller')

  router
    .group(() => {
      router.get('/', [ListAcademicPeriodsController]).as('academicPeriods.listAcademicPeriods')
      router
        .get('/current-active', [GetCurrentActiveAcademicPeriodsController])
        .as('academicPeriods.getCurrentActiveAcademicPeriods')
      router
        .get('/by-slug/:slug', [ShowAcademicPeriodBySlugController])
        .as('academicPeriods.showBySlug')
      router.post('/', [CreateAcademicPeriodController]).as('academicPeriods.createAcademicPeriod')
      router.get('/:id', [ShowAcademicPeriodController]).as('academicPeriods.showAcademicPeriod')
      router
        .put('/:id', [UpdateAcademicPeriodController])
        .as('academicPeriods.updateAcademicPeriod')
      router
        .delete('/:id', [DeleteAcademicPeriodController])
        .as('academicPeriods.deleteAcademicPeriod')
      router
        .get('/:id/courses', [ListAcademicPeriodCoursesController])
        .as('academicPeriods.listCourses')
      router
        .put('/:id/courses', [UpdateAcademicPeriodCoursesController])
        .as('academicPeriods.updateCourses')
    })
    .prefix('/academic-periods')
    .use([middleware.auth(), middleware.impersonation()])
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
      router.get('/', [ListPrintRequestsController]).as('printRequests.listPrintRequests')
      router.post('/', [CreatePrintRequestController]).as('printRequests.createPrintRequest')
      router.get('/:id', [ShowPrintRequestController]).as('printRequests.showPrintRequest')
      router
        .patch('/:id/approve', [ApprovePrintRequestController])
        .as('printRequests.approvePrintRequest')
      router
        .patch('/:id/reject', [RejectPrintRequestController])
        .as('printRequests.rejectPrintRequest')
      router
        .patch('/:id/review', [ReviewPrintRequestController])
        .as('printRequests.reviewPrintRequest')
      router
        .patch('/:id/printed', [MarkPrintRequestPrintedController])
        .as('printRequests.markPrintRequestPrinted')
    })
    .prefix('/print-requests')
    .use(middleware.auth())
}

function registerPlatformSettingsApiRoutes() {
  router
    .group(() => {
      router.get('/', [ShowPlatformSettingsController]).as('platformSettings.show')
      router.put('/', [UpdatePlatformSettingsController]).as('platformSettings.update')
    })
    .prefix('/platform-settings')
    .use(middleware.auth())
}

function registerSubscriptionPlanApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionPlansController]).as('subscriptionPlans.index')
      router.post('/', [CreateSubscriptionPlanController]).as('subscriptionPlans.store')
      router.get('/:id', [ShowSubscriptionPlanController]).as('subscriptionPlans.show')
      router.put('/:id', [UpdateSubscriptionPlanController]).as('subscriptionPlans.update')
      router.delete('/:id', [DeleteSubscriptionPlanController]).as('subscriptionPlans.destroy')
    })
    .prefix('/subscription-plans')
    .use(middleware.auth())
}

function registerSubscriptionApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionsController]).as('subscriptions.index')
      router.post('/', [CreateSubscriptionController]).as('subscriptions.store')
      router.get('/:id', [ShowSubscriptionController]).as('subscriptions.show')
      router.put('/:id', [UpdateSubscriptionController]).as('subscriptions.update')
      router.post('/:id/cancel', [CancelSubscriptionController]).as('subscriptions.cancel')
      router.post('/:id/pause', [PauseSubscriptionController]).as('subscriptions.pause')
      router
        .post('/:id/reactivate', [ReactivateSubscriptionController])
        .as('subscriptions.reactivate')
    })
    .prefix('/subscriptions')
    .use(middleware.auth())

  // School subscription route
  router
    .group(() => {
      router
        .get('/:schoolId/subscription', [GetSchoolSubscriptionController])
        .as('schools.subscription')
    })
    .prefix('/schools')
    .use(middleware.auth())

  // School chain subscription route
  router
    .group(() => {
      router
        .get('/:schoolChainId/subscription', [GetChainSubscriptionController])
        .as('schoolChains.subscription')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

function registerSubscriptionInvoiceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionInvoicesController]).as('subscriptionInvoices.index')
      router.post('/', [CreateSubscriptionInvoiceController]).as('subscriptionInvoices.store')
      router.get('/:id', [ShowSubscriptionInvoiceController]).as('subscriptionInvoices.show')
      router.put('/:id', [UpdateSubscriptionInvoiceController]).as('subscriptionInvoices.update')
      router.post('/:id/mark-paid', [MarkInvoicePaidController]).as('subscriptionInvoices.markPaid')
    })
    .prefix('/subscription-invoices')
    .use(middleware.auth())
}

function registerSchoolUsageMetricsApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetSchoolUsageMetricsController]).as('schoolUsageMetrics.show')
    })
    .prefix('/school-usage-metrics')
    .use(middleware.auth())
}

function registerPurchaseRequestApiRoutes() {
  router
    .group(() => {
      // CRUD
      router.get('/', [ListPurchaseRequestsController]).as('purchaseRequests.index')
      router.post('/', [CreatePurchaseRequestController]).as('purchaseRequests.store')
      router.get('/:id', [ShowPurchaseRequestController]).as('purchaseRequests.show')
      router.put('/:id', [UpdatePurchaseRequestController]).as('purchaseRequests.update')
      router.delete('/:id', [DeletePurchaseRequestController]).as('purchaseRequests.destroy')

      // Status actions
      router.post('/:id/approve', [ApprovePurchaseRequestController]).as('purchaseRequests.approve')
      router.post('/:id/reject', [RejectPurchaseRequestController]).as('purchaseRequests.reject')
      router.post('/:id/mark-bought', [MarkAsBoughtController]).as('purchaseRequests.markBought')
      router.post('/:id/mark-arrived', [MarkAsArrivedController]).as('purchaseRequests.markArrived')
    })
    .prefix('/purchase-requests')
    .use(middleware.auth())
}

function registerInsuranceApiRoutes() {
  router
    .group(() => {
      // Configuration
      router.get('/config', [GetInsuranceConfigController]).as('insurance.config')
      router
        .put('/school/:schoolId', [UpdateSchoolInsuranceController])
        .as('insurance.updateSchool')
      router
        .put('/chain/:chainId', [UpdateSchoolChainInsuranceController])
        .as('insurance.updateChain')
      router
        .post('/school/:schoolId/reset', [ResetSchoolInsuranceController])
        .as('insurance.resetSchool')

      // Claims
      router.get('/claims', [ListInsuranceClaimsController]).as('insurance.claims.index')
      router
        .post('/claims/:claimId/approve', [ApproveInsuranceClaimController])
        .as('insurance.claims.approve')
      router
        .post('/claims/:claimId/reject', [RejectInsuranceClaimController])
        .as('insurance.claims.reject')
      router
        .post('/claims/:claimId/mark-paid', [MarkClaimPaidController])
        .as('insurance.claims.markPaid')

      // Billings
      router.get('/billings', [ListInsuranceBillingsController]).as('insurance.billings.index')
      router
        .get('/billings/:billingId', [GetBillingDetailsController])
        .as('insurance.billings.show')

      // Analytics
      router.get('/stats', [GetInsuranceStatsController]).as('insurance.stats')
      router
        .get('/analytics/default-rate', [GetDefaultRateBySchoolController])
        .as('insurance.analytics.defaultRate')
      router
        .get('/analytics/schools-without', [GetSchoolsWithoutInsuranceController])
        .as('insurance.analytics.schoolsWithout')

      // School-specific
      router
        .get('/school/:schoolId/stats', [GetSchoolInsuranceStatsController])
        .as('insurance.school.stats')
      router
        .get('/school/:schoolId/billings', [GetSchoolInsuranceBillingsController])
        .as('insurance.school.billings')
      router
        .get('/school/:schoolId/claims', [GetSchoolInsuranceClaimsController])
        .as('insurance.school.claims')
    })
    .prefix('/insurance')
    .use(middleware.auth())
}

function registerImpersonationApiRoutes() {
  router
    .group(() => {
      // Ativar impersonation
      router.post('/', [SetImpersonationController]).as('impersonation.set')

      // Desativar impersonation
      router.delete('/', [ClearImpersonationController]).as('impersonation.clear')

      // Status de impersonation
      router.get('/status', [GetImpersonationStatusController]).as('impersonation.status')

      // Lista de usuários para impersonation
      router.get('/config', [GetImpersonationConfigController]).as('impersonation.config')
    })
    .prefix('/admin/impersonation')
    .use(middleware.auth())
}

function registerAdminOnboardingApiRoutes() {
  router
    .group(() => {
      router.post('/onboarding', [CreateSchoolOnboardingController]).as('admin.schools.onboarding')
    })
    .prefix('/admin/schools')
    .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
}

// =============================================================================
// DASHBOARD API CONTROLLERS
// =============================================================================

const GetEscolaStatsController = () => import('#controllers/dashboard/get_escola_stats_controller')
const GetResponsavelStatsController = () =>
  import('#controllers/dashboard/get_responsavel_stats_controller')
const GetAdminStatsController = () => import('#controllers/dashboard/get_admin_stats_controller')

// Responsavel API Controllers
const GetResponsavelStudentGradesController = () =>
  import('#controllers/responsavel/get_student_grades_controller')
const GetResponsavelStudentAttendanceController = () =>
  import('#controllers/responsavel/get_student_attendance_controller')
const GetResponsavelStudentPaymentsController = () =>
  import('#controllers/responsavel/get_student_payments_controller')
const GetResponsavelStudentBalanceController = () =>
  import('#controllers/responsavel/get_student_balance_controller')
const GetResponsavelStudentAssignmentsController = () =>
  import('#controllers/responsavel/get_student_assignments_controller')
const GetResponsavelStudentScheduleController = () =>
  import('#controllers/responsavel/get_student_schedule_controller')
const GetResponsavelStudentDocumentsController = () =>
  import('#controllers/responsavel/get_student_documents_controller')
const GetResponsavelStudentOccurrencesController = () =>
  import('#controllers/responsavel/get_student_occurrences_controller')
const AcknowledgeOccurrenceController = () =>
  import('#controllers/responsavel/acknowledge_occurrence_controller')

function registerDashboardApiRoutes() {
  router
    .get('/escola/stats', [GetEscolaStatsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.escolaStats')
  router
    .get('/responsavel/stats', [GetResponsavelStatsController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard.responsavelStats')

  // Responsavel student-specific routes
  router
    .group(() => {
      router
        .get('/students/:studentId/grades', [GetResponsavelStudentGradesController])
        .as('studentGrades')
      router
        .get('/students/:studentId/attendance', [GetResponsavelStudentAttendanceController])
        .as('studentAttendance')
      router
        .get('/students/:studentId/payments', [GetResponsavelStudentPaymentsController])
        .as('studentPayments')
      router
        .get('/students/:studentId/balance', [GetResponsavelStudentBalanceController])
        .as('studentBalance')
      router
        .get('/students/:studentId/assignments', [GetResponsavelStudentAssignmentsController])
        .as('studentAssignments')
      router
        .get('/students/:studentId/schedule', [GetResponsavelStudentScheduleController])
        .as('studentSchedule')
      router
        .get('/students/:studentId/documents', [GetResponsavelStudentDocumentsController])
        .as('studentDocuments')
      router
        .get('/students/:studentId/occurrences', [GetResponsavelStudentOccurrencesController])
        .as('studentOccurrences')
      router
        .post('/students/:studentId/occurrences/:occurrenceId/acknowledge', [
          AcknowledgeOccurrenceController,
        ])
        .as('acknowledgeOccurrence')
    })
    .prefix('/responsavel')
    .use([middleware.auth(), middleware.impersonation()])
    .as('responsavel.api')

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

// Public Pages
const ShowMatriculaOnlinePageController = () =>
  import('#controllers/pages/show_matricula_online_page_controller')

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
const ShowCursosNiveisPageController = () =>
  import('#controllers/pages/escola/show_cursos_niveis_page_controller')
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
const ShowNovoContratoPageController = () =>
  import('#controllers/pages/escola/show_novo_contrato_page_controller')
const ShowEditarContratoPageController = () =>
  import('#controllers/pages/escola/show_editar_contrato_page_controller')
const ShowContratoAssinaturasPageController = () =>
  import('#controllers/pages/escola/show_contrato_assinaturas_page_controller')
const ShowContratoDocusealPageController = () =>
  import('#controllers/pages/escola/show_contrato_docuseal_page_controller')
const ShowContratoFinanceiroPageController = () =>
  import('#controllers/pages/escola/show_contrato_financeiro_page_controller')
const ShowBolsasPageController = () =>
  import('#controllers/pages/escola/show_bolsas_page_controller')
const ShowSegurosPageController = () =>
  import('#controllers/pages/escola/show_seguros_page_controller')
const ShowParceirosPageController = () =>
  import('#controllers/pages/escola/show_parceiros_page_controller')
const ShowMateriasPageController = () =>
  import('#controllers/pages/escola/show_materias_page_controller')
const ShowFolhaDePontoPageController = () =>
  import('#controllers/pages/escola/show_folha_de_ponto_page_controller')
const ShowImpressaoPageController = () =>
  import('#controllers/pages/escola/show_impressao_page_controller')
const ShowSolicitacoesDeCompraPageController = () =>
  import('#controllers/pages/escola/show_solicitacoes_de_compra_page_controller')
const ShowNotificacoesPageController = () =>
  import('#controllers/pages/escola/show_notificacoes_page_controller')
const ShowNotificacoesPreferenciasPageController = () =>
  import('#controllers/pages/escola/show_notificacoes_preferencias_page_controller')
const ShowEventosPageController = () =>
  import('#controllers/pages/escola/show_eventos_page_controller')
const ShowEventoAutorizacoesPageController = () =>
  import('#controllers/pages/escola/show_evento_autorizacoes_page_controller')
const ShowMuralPageController = () => import('#controllers/pages/escola/show_mural_page_controller')
const ShowDesempenhoPageController = () =>
  import('#controllers/pages/escola/show_desempenho_page_controller')
const ShowPeriodosLetivosPageController = () =>
  import('#controllers/pages/escola/show_periodos_letivos_page_controller')
const ShowNovoPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_novo_periodo_letivo_page_controller')
const ShowPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_periodo_letivo_page_controller')
const ShowEditarPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_editar_periodo_letivo_page_controller')
const ShowCursoVisaoGeralPageController = () =>
  import('#controllers/pages/escola/show_curso_visao_geral_page_controller')
const ShowCursoTurmasPageController = () =>
  import('#controllers/pages/escola/show_curso_turmas_page_controller')
const ShowTurmaAtividadesPageController = () =>
  import('#controllers/pages/escola/show_turma_atividades_page_controller')
const ShowTurmaProvasPageController = () =>
  import('#controllers/pages/escola/show_turma_provas_page_controller')
const ShowTurmaPresencasPageController = () =>
  import('#controllers/pages/escola/show_turma_presencas_page_controller')
const ShowTurmaNotasPageController = () =>
  import('#controllers/pages/escola/show_turma_notas_page_controller')
const ShowTurmaSituacaoPageController = () =>
  import('#controllers/pages/escola/show_turma_situacao_page_controller')
const ShowGradePageController = () => import('#controllers/pages/escola/show_grade_page_controller')
const ShowHorariosPageController = () =>
  import('#controllers/pages/escola/show_horarios_page_controller')
const ShowQuadroPageController = () =>
  import('#controllers/pages/escola/show_quadro_page_controller')
const ShowOcorrenciasPageController = () =>
  import('#controllers/pages/escola/show_ocorrencias_page_controller')
const ShowAtividadesPageController = () =>
  import('#controllers/pages/escola/show_atividades_page_controller')
const ShowAtividadePageController = () =>
  import('#controllers/pages/escola/show_atividade_page_controller')
const ShowEditAtividadePageController = () =>
  import('#controllers/pages/escola/show_edit_atividade_page_controller')
const ShowProvasPageController = () =>
  import('#controllers/pages/escola/show_provas_page_controller')
const ShowProvaPageController = () => import('#controllers/pages/escola/show_prova_page_controller')
const ShowEditProvaPageController = () =>
  import('#controllers/pages/escola/show_edit_prova_page_controller')
const ShowPresencaPageController = () =>
  import('#controllers/pages/escola/show_presenca_page_controller')
const ShowCantinaCardapioPageController = () =>
  import('#controllers/pages/escola/show_cantina_cardapio_page_controller')
const ShowCantinaPdvPageController = () =>
  import('#controllers/pages/escola/show_cantina_pdv_page_controller')
const ShowCantinaVendasPageController = () =>
  import('#controllers/pages/escola/show_cantina_vendas_page_controller')
const ShowCantinaReservasPageController = () =>
  import('#controllers/pages/escola/show_cantina_reservas_page_controller')
const ShowCantinaTransferenciasPageController = () =>
  import('#controllers/pages/escola/show_cantina_transferencias_page_controller')
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
const ShowResponsavelNotasPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_notas_page_controller')
const ShowResponsavelFrequenciaPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_frequencia_page_controller')
const ShowResponsavelMensalidadesPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_mensalidades_page_controller')
const ShowResponsavelCantinaPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_cantina_page_controller')
const ShowResponsavelGamificacaoPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_gamificacao_page_controller')
const ShowResponsavelComunicadosPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_comunicados_page_controller')
const ShowResponsavelPerfilPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_perfil_page_controller')
const ShowResponsavelAutorizacoesPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_autorizacoes_page_controller')
const ShowResponsavelAtividadesPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_atividades_page_controller')
const ShowResponsavelHorarioPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_horario_page_controller')
const ShowResponsavelDocumentosPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_documentos_page_controller')
const ShowResponsavelOcorrenciasPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_ocorrencias_page_controller')

// Admin Pages
const ShowAdminDashboardPageController = () =>
  import('#controllers/pages/admin/show_admin_dashboard_page_controller')
const ShowAdminEscolasPageController = () =>
  import('#controllers/pages/admin/show_admin_escolas_page_controller')
const ShowAdminBillingDashboardPageController = () =>
  import('#controllers/pages/admin/show_admin_billing_dashboard_page_controller')
const ShowAdminBillingFaturasPageController = () =>
  import('#controllers/pages/admin/show_admin_billing_faturas_page_controller')
const ShowAdminSubscriptionsPageController = () =>
  import('#controllers/pages/admin/show_admin_subscriptions_page_controller')
const ShowAdminRedesPageController = () =>
  import('#controllers/pages/admin/show_admin_redes_page_controller')
const ShowAdminAnalyticsPageController = () =>
  import('#controllers/pages/admin/show_admin_analytics_page_controller')
const ShowAdminSegurosPageController = () =>
  import('#controllers/pages/admin/show_admin_seguros_page_controller')
const ShowAdminConfiguracoesPageController = () =>
  import('#controllers/pages/admin/show_admin_configuracoes_page_controller')
const ShowSchoolOnboardingPageController = () =>
  import('#controllers/pages/admin/show_school_onboarding_page_controller')
const ShowSchoolDetailsPageController = () =>
  import('#controllers/pages/admin/show_school_details_page_controller')
const ShowEditSchoolPageController = () =>
  import('#controllers/pages/admin/show_edit_school_page_controller')

// =============================================================================
// PAGE ROUTE FUNCTIONS (Inertia)
// =============================================================================

function registerPageRoutes() {
  router
    .group(() => {
      // Public home
      router.on('/').renderInertia('home').as('home')

      // Public enrollment page
      router
        .get('/:schoolSlug/matricula-online/:academicPeriodSlug/:courseSlug', [
          ShowMatriculaOnlinePageController,
        ])
        .as('matriculaOnline')

      // Auth pages
      router.get('/sign-in', [ShowSignInPageController]).as('auth.signIn')
      router.get('/login', [ShowSignInPageController]).as('auth.login') // Alias

      // Dashboard router (redirects based on role)
      router
        .get('/dashboard', [ShowDashboardPageController])
        .use([middleware.auth(), middleware.impersonation()])
        .as('dashboard')

      // Escola pages (school staff)
      router
        .group(() => {
          router.get('/', [ShowEscolaDashboardPageController]).as('dashboard')
          router.get('/periodos-letivos', [ShowPeriodosLetivosPageController]).as('periodosLetivos')
          router
            .get('/periodos-letivos/:slug', [ShowPeriodoLetivoPageController])
            .as('periodosLetivos.show')
          router
            .get('/administrativo/periodos-letivos/novo-periodo-letivo', [
              ShowNovoPeriodoLetivoPageController,
            ])
            .as('administrativo.novoPeriodoLetivo')
          router
            .get('/administrativo/periodos-letivos/:id/editar', [
              ShowEditarPeriodoLetivoPageController,
            ])
            .as('administrativo.periodosLetivos.editar')

          // Curso pages (within periodo letivo)
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/visao-geral', [
              ShowCursoVisaoGeralPageController,
            ])
            .as('periodosLetivos.cursos.visaoGeral')
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas', [
              ShowCursoTurmasPageController,
            ])
            .as('periodosLetivos.cursos.turmas')

          // Turma pages (within curso)
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/atividades', [
              ShowTurmaAtividadesPageController,
            ])
            .as('periodosLetivos.cursos.turmas.atividades')
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/provas', [
              ShowTurmaProvasPageController,
            ])
            .as('periodosLetivos.cursos.turmas.provas')
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/presencas', [
              ShowTurmaPresencasPageController,
            ])
            .as('periodosLetivos.cursos.turmas.presencas')
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/notas', [
              ShowTurmaNotasPageController,
            ])
            .as('periodosLetivos.cursos.turmas.notas')
          router
            .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/situacao', [
              ShowTurmaSituacaoPageController,
            ])
            .as('periodosLetivos.cursos.turmas.situacao')

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
            .get('/administrativo/contratos/novo', [ShowNovoContratoPageController])
            .as('administrativo.contratos.novo')
          router
            .get('/administrativo/contratos/:id/editar', [ShowEditarContratoPageController])
            .as('administrativo.contratos.editar')
          router
            .get('/administrativo/contratos/:id/assinaturas', [
              ShowContratoAssinaturasPageController,
            ])
            .as('administrativo.contratos.assinaturas')
          router
            .get('/administrativo/contratos/:id/docuseal', [ShowContratoDocusealPageController])
            .as('administrativo.contratos.docuseal')
          router
            .get('/administrativo/contratos/:contractId/financeiro', [
              ShowContratoFinanceiroPageController,
            ])
            .as('administrativo.contratos.financeiro')
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
          router
            .get('/administrativo/solicitacoes-de-compra', [ShowSolicitacoesDeCompraPageController])
            .as('administrativo.solicitacoesDeCompra')

          // Notificações
          router.get('/notificacoes', [ShowNotificacoesPageController]).as('notificacoes')
          router
            .get('/notificacoes/preferencias', [ShowNotificacoesPreferenciasPageController])
            .as('notificacoes.preferencias')

          // Eventos
          router.get('/eventos', [ShowEventosPageController]).as('eventos')
          router
            .get('/eventos/:eventId/autorizacoes', [ShowEventoAutorizacoesPageController])
            .as('eventos.autorizacoes')

          // Mural
          router.get('/mural', [ShowMuralPageController]).as('mural')

          // Desempenho Academico
          router.get('/desempenho', [ShowDesempenhoPageController]).as('desempenho')

          // Matrículas
          router.get('/matriculas', [ShowMatriculasPageController]).as('matriculas')

          // Pedagógico
          router.get('/pedagogico/turmas', [ShowTurmasPageController]).as('pedagogico.turmas')
          router.get('/pedagogico/grade', [ShowGradePageController]).as('pedagogico.grade')
          router.get('/pedagogico/horarios', [ShowHorariosPageController]).as('pedagogico.horarios')
          router.get('/pedagogico/quadro', [ShowQuadroPageController]).as('pedagogico.quadro')
          router
            .get('/pedagogico/ocorrencias', [ShowOcorrenciasPageController])
            .as('pedagogico.ocorrencias')
          router
            .get('/pedagogico/atividades', [ShowAtividadesPageController])
            .as('pedagogico.atividades')
          router
            .get('/pedagogico/atividades/:id', [ShowAtividadePageController])
            .as('pedagogico.atividades.show')
          router
            .get('/pedagogico/atividades/:id/editar', [ShowEditAtividadePageController])
            .as('pedagogico.atividades.edit')
          router.get('/pedagogico/provas', [ShowProvasPageController]).as('pedagogico.provas')
          router
            .get('/pedagogico/provas/:id', [ShowProvaPageController])
            .as('pedagogico.provas.show')
          router
            .get('/pedagogico/provas/:id/editar', [ShowEditProvaPageController])
            .as('pedagogico.provas.edit')
          router.get('/pedagogico/presenca', [ShowPresencaPageController]).as('pedagogico.presenca')
          router
            .get('/pedagogico/cursos-niveis', [ShowCursosNiveisPageController])
            .as('pedagogico.cursosNiveis')

          // Cantina
          router.get('/cantina/itens', [ShowCantinaItensPageController]).as('cantina.itens')
          router
            .get('/cantina/cardapio', [ShowCantinaCardapioPageController])
            .as('cantina.cardapio')
          router.get('/cantina/pdv', [ShowCantinaPdvPageController]).as('cantina.pdv')
          router.get('/cantina/pedidos', [ShowCantinaPedidosPageController]).as('cantina.pedidos')
          router.get('/cantina/vendas', [ShowCantinaVendasPageController]).as('cantina.vendas')
          router
            .get('/cantina/reservas', [ShowCantinaReservasPageController])
            .as('cantina.reservas')
          router
            .get('/cantina/transferencias', [ShowCantinaTransferenciasPageController])
            .as('cantina.transferencias')

          // Financeiro
          router
            .get('/financeiro/mensalidades', [ShowMensalidadesPageController])
            .as('financeiro.mensalidades')
          router
            .get('/financeiro/inadimplencia', [ShowInadimplenciaPageController])
            .as('financeiro.inadimplencia')
          router.get('/financeiro/seguros', [ShowSegurosPageController]).as('financeiro.seguros')

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
        .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
        .as('escola')

      // Responsavel pages (parents/guardians)
      router
        .group(() => {
          router.get('/', [ShowResponsavelDashboardPageController]).as('dashboard')
          router.get('/notas', [ShowResponsavelNotasPageController]).as('notas')
          router.get('/frequencia', [ShowResponsavelFrequenciaPageController]).as('frequencia')
          router
            .get('/mensalidades', [ShowResponsavelMensalidadesPageController])
            .as('mensalidades')
          router.get('/cantina', [ShowResponsavelCantinaPageController]).as('cantina')
          router.get('/gamificacao', [ShowResponsavelGamificacaoPageController]).as('gamificacao')
          router.get('/comunicados', [ShowResponsavelComunicadosPageController]).as('comunicados')
          router
            .get('/autorizacoes', [ShowResponsavelAutorizacoesPageController])
            .as('autorizacoes')
          router.get('/atividades', [ShowResponsavelAtividadesPageController]).as('atividades')
          router.get('/horario', [ShowResponsavelHorarioPageController]).as('horario')
          router.get('/documentos', [ShowResponsavelDocumentosPageController]).as('documentos')
          router.get('/ocorrencias', [ShowResponsavelOcorrenciasPageController]).as('ocorrencias')
          router.get('/perfil', [ShowResponsavelPerfilPageController]).as('perfil')
        })
        .prefix('/responsavel')
        .use([middleware.auth(), middleware.impersonation()])
        .as('responsavel')

      // Admin pages (platform admins)
      router
        .group(() => {
          router.get('/', [ShowAdminDashboardPageController]).as('dashboard')
          router.get('/escolas', [ShowAdminEscolasPageController]).as('escolas')
          router.get('/escolas/:id/editar', [ShowEditSchoolPageController]).as('escolas.edit')
          router.get('/escolas/:id', [ShowSchoolDetailsPageController]).as('escolas.show')
          router.get('/onboarding', [ShowSchoolOnboardingPageController]).as('onboarding')
          router
            .get('/billing/dashboard', [ShowAdminBillingDashboardPageController])
            .as('billing.dashboard')
          router
            .get('/billing/faturas', [ShowAdminBillingFaturasPageController])
            .as('billing.faturas')
          router
            .get('/billing/subscriptions', [ShowAdminSubscriptionsPageController])
            .as('billing.subscriptions')
          router.get('/redes', [ShowAdminRedesPageController]).as('redes')
          router.get('/configuracoes', [ShowAdminConfiguracoesPageController]).as('configuracoes')

          // Seguros pages
          router.get('/seguros', [ShowAdminSegurosPageController]).as('seguros.index')
          router
            .get('/seguros/sinistros', [ShowAdminSegurosPageController, 'sinistros'])
            .as('seguros.sinistros')
          router
            .get('/seguros/faturamento', [ShowAdminSegurosPageController, 'faturamento'])
            .as('seguros.faturamento')
          router
            .get('/seguros/analytics', [ShowAdminSegurosPageController, 'analytics'])
            .as('seguros.analytics')
          router
            .get('/seguros/configuracao', [ShowAdminSegurosPageController, 'configuracao'])
            .as('seguros.configuracao')

          // Analytics pages
          router
            .get('/analytics', [ShowAdminAnalyticsPageController, 'index'])
            .as('analytics.index')
          router
            .get('/analytics/academico', [ShowAdminAnalyticsPageController, 'academico'])
            .as('analytics.academico')
          router
            .get('/analytics/presenca', [ShowAdminAnalyticsPageController, 'presenca'])
            .as('analytics.presenca')
          router
            .get('/analytics/cantina', [ShowAdminAnalyticsPageController, 'cantina'])
            .as('analytics.cantina')
          router
            .get('/analytics/pagamentos', [ShowAdminAnalyticsPageController, 'pagamentos'])
            .as('analytics.pagamentos')
          router
            .get('/analytics/matriculas', [ShowAdminAnalyticsPageController, 'matriculas'])
            .as('analytics.matriculas')
          router
            .get('/analytics/ocorrencias', [ShowAdminAnalyticsPageController, 'ocorrencias'])
            .as('analytics.ocorrencias')
          router
            .get('/analytics/gamificacao', [ShowAdminAnalyticsPageController, 'gamificacao'])
            .as('analytics.gamificacao')
          router.get('/analytics/rh', [ShowAdminAnalyticsPageController, 'rh']).as('analytics.rh')
        })
        .prefix('/admin')
        .use([
          middleware.auth(),
          middleware.impersonation(),
          middleware.requireRole(['SUPER_ADMIN', 'ADMIN']),
        ])
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
    registerSchoolSwitcherApiRoutes()
    registerStudentApiRoutes()
    registerResponsibleApiRoutes()
    registerResponsibleAddressApiRoutes()
    registerContractApiRoutes()
    registerContractDocumentApiRoutes()
    registerCourseApiRoutes()
    registerLevelApiRoutes()
    registerCourseHasAcademicPeriodApiRoutes()
    registerLevelAssignmentApiRoutes()
    registerClassApiRoutes()
    registerSubjectApiRoutes()
    registerScheduleApiRoutes()
    registerTeacherApiRoutes()
    registerExamApiRoutes()
    registerGradesApiRoutes()
    registerAnalyticsApiRoutes()
    registerEventApiRoutes()
    registerParentalConsentApiRoutes()
    registerOnlineEnrollmentApiRoutes()
    registerEnrollmentManagementApiRoutes()
    registerNotificationApiRoutes()
    registerNotificationPreferenceApiRoutes()
    registerPostApiRoutes()
    registerCommentApiRoutes()
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
    registerPurchaseRequestApiRoutes()
    registerInsuranceApiRoutes()
    registerImpersonationApiRoutes()
    registerAdminOnboardingApiRoutes()
  })
  .prefix('/api/v1')
  .as('api.v1')
