-- Comprehensive cleanup script for Test Schools
-- WARNING: This script disables foreign key checks temporarily
-- Use with extreme caution!

BEGIN;

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Get test school IDs
CREATE TEMP TABLE test_schools AS 
SELECT id FROM "School" WHERE name = 'Test School';

-- Get all related IDs
CREATE TEMP TABLE test_classes AS 
SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_periods AS 
SELECT id FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_contracts AS 
SELECT id FROM "Contract" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_courses AS 
SELECT id FROM "Course" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_levels AS 
SELECT id FROM "Level" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_subjects AS 
SELECT id FROM "Subject" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_users AS 
SELECT "userId" as id FROM "UserHasSchool" WHERE "schoolId" IN (SELECT id FROM test_schools);

CREATE TEMP TABLE test_students AS 
SELECT id FROM "Student" WHERE "id" IN (SELECT id FROM test_users);

CREATE TEMP TABLE test_teachers AS 
SELECT id FROM "Teacher" WHERE "id" IN (SELECT id FROM test_users);

-- Delete all related data (order doesn't matter with FK checks disabled)
DELETE FROM "StudentHasAttendance" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentHasAcademicPeriod" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "StudentHasLevel" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "StudentHasExtraClass" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentHasExtraClassAttendance" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentHasAssignment" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentHasResponsible" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentHasSchoolPartner" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentAddress" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentAvatar" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentBalanceTransaction" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentCanteenCategoryRestriction" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentDocument" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentEmergencyContact" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentGamification" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentMedicalInfo" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StudentPayment" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "WalletTopUp" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "CanteenMealReservation" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "EventParentalConsent" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "EventStudentPayment" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "GamificationEvent" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "IndividualDiscount" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "Invoice" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "LeaderboardEntry" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "Occurence" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "SchoolAnnouncementRecipient" WHERE "studentId" IN (SELECT id FROM test_students);
DELETE FROM "StoreOrder" WHERE "studentId" IN (SELECT id FROM test_students);

DELETE FROM "CalendarSlot" WHERE "calendarId" IN (SELECT id FROM "Calendar" WHERE "classId" IN (SELECT id FROM test_classes));
DELETE FROM "Calendar" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "TeacherHasClass" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "ClassHasAcademicPeriod" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "ClassSchedule" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "EventClass" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "FixedClass" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "Leaderboard" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "exams" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools);

DELETE FROM "ContractDocument" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ContractEarlyDiscount" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ContractInterestConfig" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ContractPaymentDay" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ExtraClass" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "Invoice" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "Level" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "StudentPayment" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "Contract" WHERE "schoolId" IN (SELECT id FROM test_schools);

DELETE FROM "LevelAssignedToCourseHasAcademicPeriod" WHERE "courseHasAcademicPeriodId" IN (SELECT id FROM "CourseHasAcademicPeriod" WHERE "academicPeriodId" IN (SELECT id FROM test_periods));
DELETE FROM "CourseHasAcademicPeriod" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "AcademicPeriodHoliday" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "AcademicPeriodWeekendClass" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "Assignment" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "ExtraClass" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "exams" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools);

DELETE FROM "LevelAssignedToCourseHasAcademicPeriod" WHERE "levelId" IN (SELECT id FROM test_levels);
DELETE FROM "EventLevel" WHERE "levelId" IN (SELECT id FROM test_levels);
DELETE FROM "Level" WHERE "schoolId" IN (SELECT id FROM test_schools);

DELETE FROM "CourseHasAcademicPeriod" WHERE "courseId" IN (SELECT id FROM test_courses);
DELETE FROM "Course" WHERE "schoolId" IN (SELECT id FROM test_schools);

DELETE FROM "Subject" WHERE "schoolId" IN (SELECT id FROM test_schools);

DELETE FROM "CoordinatorHasLevel" WHERE "coordinatorId" IN (SELECT id FROM test_users);

DELETE FROM "Student" WHERE "id" IN (SELECT id FROM test_students);
DELETE FROM "Teacher" WHERE "id" IN (SELECT id FROM test_teachers);

-- Clean up gamification and other school-related data
DELETE FROM "Achievement" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Canteen" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Challenge" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Event" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "ExtraClass" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "IndividualDiscount" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "InsuranceBilling" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Leaderboard" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "PaymentSettings" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Post" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "PurchaseRequest" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Scholarship" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "SchoolAchievementConfig" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "SchoolAnnouncement" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "SchoolGamificationSettings" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "SchoolHasGroup" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "SchoolPartner" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "SchoolUsageMetrics" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Store" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "StoreItem" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "StoreOrder" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Subscription" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Timesheet" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "TuitionTransfer" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "UserSchoolSelection" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Delete user associations
DELETE FROM "UserHasSchool" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Finally delete the schools
DELETE FROM "School" WHERE id IN (SELECT id FROM test_schools);

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Cleanup temp tables
DROP TABLE test_schools;
DROP TABLE test_classes;
DROP TABLE test_periods;
DROP TABLE test_contracts;
DROP TABLE test_courses;
DROP TABLE test_levels;
DROP TABLE test_subjects;
DROP TABLE test_users;
DROP TABLE test_students;
DROP TABLE test_teachers;

COMMIT;

SELECT 'Cleanup completed successfully' as status;
