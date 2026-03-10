-- Comprehensive cleanup script for Test Schools (without FK disable)
-- Deletes in correct order to respect foreign keys

BEGIN;

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

CREATE TEMP TABLE test_users AS 
SELECT "userId" as id FROM "UserHasSchool" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 1: Delete from deepest dependencies first
-- Student-related tables (deepest level)
DELETE FROM "StudentHasAttendance" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentHasAcademicPeriod" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentHasExtraClass" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentHasExtraClassAttendance" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentHasAssignment" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentHasResponsible" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentHasSchoolPartner" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentAddress" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentAvatar" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentBalanceTransaction" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentCanteenCategoryRestriction" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentDocument" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentEmergencyContact" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentGamification" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentMedicalInfo" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StudentPayment" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "WalletTopUp" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "CanteenMealReservation" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "EventParentalConsent" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "EventStudentPayment" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "GamificationEvent" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "IndividualDiscount" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "Invoice" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "LeaderboardEntry" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "Occurence" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "SchoolAnnouncementRecipient" WHERE "studentId" IN (SELECT id FROM test_users);
DELETE FROM "StoreOrder" WHERE "studentId" IN (SELECT id FROM test_users);

-- Step 2: Calendar and slots
DELETE FROM "CalendarSlot" WHERE "calendarId" IN (SELECT id FROM "Calendar" WHERE "classId" IN (SELECT id FROM test_classes));
DELETE FROM "Calendar" WHERE "classId" IN (SELECT id FROM test_classes);

-- Step 3: Class associations
DELETE FROM "TeacherHasClass" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "StudentHasLevel" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "ClassHasAcademicPeriod" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "ClassSchedule" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "EventClass" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "FixedClass" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "Leaderboard" WHERE "classId" IN (SELECT id FROM test_classes);
DELETE FROM "exams" WHERE "classId" IN (SELECT id FROM test_classes);

-- Step 4: Contract data (before deleting contracts)
DELETE FROM "ContractDocument" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ContractEarlyDiscount" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ContractInterestConfig" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ContractPaymentDay" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "ExtraClass" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "Invoice" WHERE "contractId" IN (SELECT id FROM test_contracts);
DELETE FROM "StudentPayment" WHERE "contractId" IN (SELECT id FROM test_contracts);

-- Step 5: Delete contracts
DELETE FROM "Contract" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 6: Academic period data (before deleting periods)
DELETE FROM "AcademicPeriodHoliday" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "AcademicPeriodWeekendClass" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "Assignment" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "ExtraClass" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);
DELETE FROM "exams" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);

-- Step 7: Course/Period associations
DELETE FROM "LevelAssignedToCourseHasAcademicPeriod" 
WHERE "courseHasAcademicPeriodId" IN (
  SELECT id FROM "CourseHasAcademicPeriod" 
  WHERE "academicPeriodId" IN (SELECT id FROM test_periods)
);
DELETE FROM "CourseHasAcademicPeriod" WHERE "academicPeriodId" IN (SELECT id FROM test_periods);

-- Step 8: Academic periods
DELETE FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 9: Level associations and levels
DELETE FROM "LevelAssignedToCourseHasAcademicPeriod" 
WHERE "levelId" IN (SELECT id FROM "Level" WHERE "schoolId" IN (SELECT id FROM test_schools));
DELETE FROM "EventLevel" WHERE "levelId" IN (SELECT id FROM "Level" WHERE "schoolId" IN (SELECT id FROM test_schools));
DELETE FROM "Level" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 10: Course associations and courses
DELETE FROM "CourseHasAcademicPeriod" WHERE "courseId" IN (SELECT id FROM "Course" WHERE "schoolId" IN (SELECT id FROM test_schools));
DELETE FROM "Course" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 11: Delete classes (after all associations)
DELETE FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 12: Subjects
DELETE FROM "Subject" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 13: Coordinator associations
DELETE FROM "CoordinatorHasLevel" WHERE "coordinatorId" IN (SELECT id FROM test_users);

-- Step 14: Delete students and teachers
DELETE FROM "Student" WHERE "id" IN (SELECT id FROM test_users);
DELETE FROM "Teacher" WHERE "id" IN (SELECT id FROM test_users);

-- Step 15: School-related data (gamification, etc.)
DELETE FROM "Achievement" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Canteen" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Challenge" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "Event" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "IndividualDiscount" WHERE "schoolId" IN (SELECT id FROM test_schools);
DELETE FROM "InsuranceBilling" WHERE "schoolId" IN (SELECT id FROM test_schools);
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

-- Step 16: User associations
DELETE FROM "UserHasSchool" WHERE "schoolId" IN (SELECT id FROM test_schools);

-- Step 17: Finally delete the schools
DELETE FROM "School" WHERE id IN (SELECT id FROM test_schools);

-- Cleanup temp tables
DROP TABLE test_schools;
DROP TABLE test_classes;
DROP TABLE test_periods;
DROP TABLE test_contracts;
DROP TABLE test_users;

COMMIT;

SELECT 'Cleanup completed successfully' as status;
