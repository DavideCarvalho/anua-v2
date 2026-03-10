-- Script to clean up test data from database
-- Deletes all schools with 'Test' in name or slug, and all related data

BEGIN;

-- Get all test school IDs
WITH test_schools AS (
  SELECT id FROM "School" WHERE name LIKE '%Test%' OR slug LIKE '%test%'
),
-- Delete related records in order (respecting foreign keys)
deleted_student_has_attendance AS (
  DELETE FROM "StudentHasAttendance" 
  WHERE "studentId" IN (
    SELECT s.id FROM "Student" s 
    JOIN "User" u ON s.id = u.id 
    JOIN "UserHasSchool" us ON u.id = us."userId" 
    WHERE us."schoolId" IN (SELECT id FROM test_schools)
  )
),
deleted_attendance AS (
  DELETE FROM "Attendance" 
  WHERE "classId" IN (SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_calendar_slot AS (
  DELETE FROM "CalendarSlot" 
  WHERE "calendarId" IN (SELECT id FROM "Calendar" WHERE "classId" IN (
    SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools)
  ))
),
deleted_calendar AS (
  DELETE FROM "Calendar" 
  WHERE "classId" IN (SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_teacher_has_class AS (
  DELETE FROM "TeacherHasClass" 
  WHERE "classId" IN (SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_student_has_level AS (
  DELETE FROM "StudentHasLevel" 
  WHERE "classId" IN (SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_class_has_academic_period AS (
  DELETE FROM "ClassHasAcademicPeriod" 
  WHERE "classId" IN (SELECT id FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_class AS (
  DELETE FROM "Class" WHERE "schoolId" IN (SELECT id FROM test_schools)
),
deleted_contract_payment_day AS (
  DELETE FROM "ContractPaymentDay" 
  WHERE "contractId" IN (SELECT id FROM "Contract" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_contract AS (
  DELETE FROM "Contract" WHERE "schoolId" IN (SELECT id FROM test_schools)
),
deleted_level_assigned AS (
  DELETE FROM "LevelAssignedToCourseHasAcademicPeriod" 
  WHERE "courseHasAcademicPeriodId" IN (
    SELECT id FROM "CourseHasAcademicPeriod" WHERE "academicPeriodId" IN (
      SELECT id FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools)
    )
  )
),
deleted_course_has_academic_period AS (
  DELETE FROM "CourseHasAcademicPeriod" 
  WHERE "academicPeriodId" IN (SELECT id FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_academic_period_holiday AS (
  DELETE FROM "AcademicPeriodHoliday" 
  WHERE "academicPeriodId" IN (SELECT id FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools))
),
deleted_academic_period AS (
  DELETE FROM "AcademicPeriod" WHERE "schoolId" IN (SELECT id FROM test_schools)
),
deleted_level AS (
  DELETE FROM "Level" WHERE "schoolId" IN (SELECT id FROM test_schools)
),
deleted_subject AS (
  DELETE FROM "Subject" WHERE "schoolId" IN (SELECT id FROM test_schools)
),
deleted_coordinator_has_level AS (
  DELETE FROM "CoordinatorHasLevel" 
  WHERE "coordinatorId" IN (
    SELECT u.id FROM "User" u 
    JOIN "UserHasSchool" us ON u.id = us."userId" 
    WHERE us."schoolId" IN (SELECT id FROM test_schools)
  )
),
deleted_student AS (
  DELETE FROM "Student" 
  WHERE "id" IN (
    SELECT s.id FROM "Student" s 
    JOIN "User" u ON s.id = u.id 
    JOIN "UserHasSchool" us ON u.id = us."userId" 
    WHERE us."schoolId" IN (SELECT id FROM test_schools)
  )
),
deleted_teacher AS (
  DELETE FROM "Teacher" 
  WHERE "id" IN (
    SELECT t.id FROM "Teacher" t 
    JOIN "User" u ON t.id = u.id 
    JOIN "UserHasSchool" us ON u.id = us."userId" 
    WHERE us."schoolId" IN (SELECT id FROM test_schools)
  )
),
deleted_user_has_school AS (
  DELETE FROM "UserHasSchool" WHERE "schoolId" IN (SELECT id FROM test_schools)
),
deleted_users AS (
  DELETE FROM "User" 
  WHERE "id" NOT IN (SELECT "userId" FROM "UserHasSchool")
  AND "id" IN (
    SELECT u.id FROM "User" u 
    LEFT JOIN "UserHasSchool" us ON u.id = us."userId" 
    WHERE us."userId" IS NULL
    AND (u.email LIKE '%test%' OR u.slug LIKE '%test%')
  )
)
-- Finally delete the test schools
DELETE FROM "School" WHERE id IN (SELECT id FROM test_schools);

COMMIT;
