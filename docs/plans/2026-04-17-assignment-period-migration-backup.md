# Assignment Academic Period Migration Backup (2026-04-17)

## Context

- Requested fix: assignments not appearing in Fundamental pages because they were linked to the wrong academic period.
- Scope fixed: classes
  - `turma-a-019c49-10`
  - `turma-a-019c49-11`
  - `turma-a-019c49-12`

## Source and target periods

- Source period (wrong):
  - `id`: `019c0b39-4107-71fe-a6ba-0e71a14a07e4`
  - `slug`: `educacao-infantil-2026`
- Target period (correct):
  - `id`: `019c48e2-edc8-727f-80ac-83e7a44864d9`
  - `slug`: `ensino-fundamental-2026-2031`

## Snapshot before migration

- `turma-a-019c49-10`: 15 assignments in `educacao-infantil-2026`
- `turma-a-019c49-11`: 10 assignments in `educacao-infantil-2026`
- `turma-a-019c49-12`: 52 assignments in `educacao-infantil-2026`
- Total mismatched assignments: **77**

## Executed migration

```sql
WITH target_classes AS (
  SELECT id
  FROM "Class"
  WHERE slug IN ('turma-a-019c49-10','turma-a-019c49-11','turma-a-019c49-12')
), target_period AS (
  SELECT id
  FROM "AcademicPeriod"
  WHERE slug = 'ensino-fundamental-2026-2031'
), to_update AS (
  SELECT a.id
  FROM "Assignment" a
  JOIN "TeacherHasClass" thc ON thc.id = a."teacherHasClassId"
  JOIN target_classes tc ON tc.id = thc."classId"
  CROSS JOIN target_period tp
  WHERE a."academicPeriodId" IS DISTINCT FROM tp.id
)
UPDATE "Assignment" a
SET "academicPeriodId" = (SELECT id FROM target_period)
WHERE a.id IN (SELECT id FROM to_update);
```

- Rows updated: **77**

## Verification after migration

- `turma-a-019c49-10`: 15 assignments in `ensino-fundamental-2026-2031`
- `turma-a-019c49-11`: 10 assignments in `ensino-fundamental-2026-2031`
- `turma-a-019c49-12`: 52 assignments in `ensino-fundamental-2026-2031`

## Rollback SQL (exact updated set)

```sql
UPDATE "Assignment"
SET "academicPeriodId" = '019c0b39-4107-71fe-a6ba-0e71a14a07e4'
WHERE id IN (
  '019d6436-9779-74e1-82d7-d757c43b78c5',
  '019d6434-65dc-758a-b4e4-db917484cbbe',
  '019d633d-d5a8-772b-9e5a-a41863b286f8',
  '019d268f-2f99-766a-804e-52576cb91e56',
  '019cfd31-c221-70c8-99b3-a2af4b43816f',
  '019d4a9b-962f-7728-929f-e12d07693ada',
  '019d4569-0141-713a-a1ed-b6edfcd115df',
  '019d3072-449a-7565-9b92-34a2431a1c00',
  '019d1c2d-6a76-747a-bcf2-9fef5afaf09a',
  '019d4ab2-32a9-75dc-b8f8-bc6ace3150f9',
  '019d457f-a241-744e-b310-a658370de15a',
  '019d2f8f-816c-7297-a117-47951f93c60d',
  '019d6440-7ec4-720b-b4cd-be5307429fe5',
  '019cf7c7-681e-748e-bfeb-2a7c241752aa',
  '019d4050-b81e-721b-bb1d-0e065a1d85d9',
  '019d6ebb-0aa7-764f-abe2-e8e845825378',
  '019d1c26-d04f-7008-8af0-28afb82a1027',
  '019d4f76-300c-775e-ae42-8205f82174ce',
  '019d6921-7eae-7278-8692-69454597fd8d',
  '019d6831-0866-738d-ae2c-80b0ef097256',
  '019d457a-c28a-778f-af23-aec18b2388cf',
  '019d78fd-db22-7538-98bf-5b8d84f2d96a',
  '019d4aa7-092a-77aa-baeb-a7a79c1f9a25',
  '019d4043-ba03-74ae-8967-3980d5f940f9',
  '019d73ce-6974-731e-8b0b-972835537c79',
  '019d3fd5-ea07-7205-8507-b615dbdfd22d',
  '019d0c64-bf7b-7766-8990-bdeda70c9d17',
  '019d07b5-1678-77d9-a6d1-ae88a310b727',
  '019d3fd6-7052-760a-91e9-dbb035d60b71',
  '019d4042-1b32-738a-a03a-f666c040932b',
  '019d4581-d215-7509-847d-a159b2611a4c',
  '019d217a-d4b0-778c-9220-d06210b89598',
  '019cfd33-30c3-73b8-a669-58e0be62a6f6',
  '019d1c29-25cc-72ee-bdaf-314ec11f50d4',
  '019d30b4-0c37-755a-830a-fe4a3f0aaa0a',
  '019d73c9-da5e-7786-a501-22b2a7f61afc',
  '019d978e-6218-7055-9a4e-dd5867dd9197',
  '019d457d-9da5-768e-8c93-fbd0645af238',
  '019d07b2-fc3d-77d8-acbe-fa9045f27f58',
  '019d217c-db42-7095-8685-8ae1a3ca2840',
  '019d0ca2-0831-748d-ad85-f0e518ae2cba',
  '019d4aa4-ae13-7043-b73f-7ce0ebdd6f6a',
  '019d2b9c-3e68-7088-869e-647526f54751',
  '019d4ab3-7971-7499-8d4b-6ab7fe60402b',
  '019cf7cc-8694-709d-aacc-5cd768cb9647',
  '019d0ca0-e9ec-7692-ac72-58411f2bed5a',
  '019d6d8b-7590-766a-8c17-e4e07d8beb4e',
  '019d78fe-fee4-7588-9252-a6deadcd1740',
  '019d212d-dad0-748d-be83-1f9a60f5957f',
  '019d268e-0df6-755f-9330-a56e60c0c9da',
  '019d6976-5e05-7789-9553-94fb64637dbb',
  '019d92c0-b40a-7095-9b73-8bd190bef314',
  '019d07b4-a6f7-7799-8c1b-87ef31710ea5',
  '019d73cd-cb79-76ff-b28c-ec72884729bc',
  '019d4043-1087-772a-a743-a29754c83b22',
  '019d6975-aa00-7663-aae3-8648e1ffe117',
  '019d644a-a426-7368-b552-f2de5c0705ac',
  '019d4aa5-b7b7-775c-97eb-7e572ccfc455',
  '019d73ca-bc55-718e-a489-a983dac9fdcf',
  '019d07b6-0f5f-7388-b5b7-3871f76b1d3b',
  '019d07b4-07a4-72cc-9c94-639d28596f3f',
  '019cf7c3-a8f3-7451-b8e4-6a5816b31703',
  '019cfd36-de0a-73bd-88bd-b70ed07da818',
  '019d2b9a-21ec-748d-adc4-0a98f8e069e0',
  '019d2b9a-b0fb-738b-a3e5-1708a58b7180',
  '019d217c-1cee-74f2-b667-c4d35068fe84',
  '019d6ebc-75fe-749a-94b4-955d4f0b6f01',
  '019d6ebd-60a2-73da-8929-8d634110b50d',
  '019d4a9a-8447-71be-b0e4-da003a7ea306',
  '019d7900-5a9d-738c-8acd-3af0c1054094',
  '019d4053-9316-73aa-a443-b8e9a5a28056',
  '019d0776-bc5d-73f3-88e3-80f565ce135f',
  '019d30c5-cbb9-717d-9157-4fab4addae00',
  '019d4aa3-0bd0-70ba-8b54-72080bbb2096',
  '019d456d-48be-71b9-9712-aef914ea8c09',
  '019d6439-bf46-762b-b87f-1f1f90a27f34',
  '019d212c-8c4b-75ef-8231-8690a0ade501'
);
```

## Notes

- This document is intended as a reversible migration record.
- Rollback is deterministic because it targets the exact set of updated assignment IDs.
