#!/bin/bash
# Script to safely clean up test data
# WARNING: Run this only if you're sure you want to delete test data

echo "=== Test Data Cleanup Report ==="
echo ""

# Count test schools
PGPASSWORD="S-FO:E(9Q%Lv=G!%Y\$or2u#eo1#flNv" psql -h 34.39.158.54 -U app_user -d school_super_app -c "
SELECT 
  'Test Schools' as type,
  COUNT(*) as count
FROM \"School\" 
WHERE name LIKE '%Test%' OR slug LIKE '%test%'

UNION ALL

SELECT 
  'Test Users' as type,
  COUNT(*) as count
FROM \"User\" 
WHERE email LIKE '%test%' OR slug LIKE '%test%'

UNION ALL

SELECT 
  'Test Academic Periods' as type,
  COUNT(*) as count
FROM \"AcademicPeriod\" ap
JOIN \"School\" s ON ap.\"schoolId\" = s.id
WHERE s.name LIKE '%Test%' OR s.slug LIKE '%test%';
"

echo ""
echo "To delete test data safely, run:"
echo "  node scripts/cleanup-test-data.ts"
echo ""
echo "WARNING: This will delete ALL data associated with test schools!"
