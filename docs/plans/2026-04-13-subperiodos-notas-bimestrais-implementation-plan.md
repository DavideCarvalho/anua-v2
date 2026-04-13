# Sub-Períodos de Notas (Bimestral/Trimestral/Semestral) - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow schools to configure period subdivision type (bimestral/trimestral/semestral) and organize grades into sub-periods with recovery and weighted average calculation.

**Architecture:** Add `periodStructure` and `recoveryGradeMethod` to School model. Create new `AcademicSubPeriod` model as child of `AcademicPeriod`. Add nullable `subPeriodId` to Exam and Assignment. Add recovery grade fields to ExamGrade and StudentHasAssignment. All changes are additive and nullable for zero-impact on existing data.

**Tech Stack:** AdonisJS 6, Lucid ORM, PostgreSQL, Vine validator, Japa testing

---

### Task 1: Create PeriodStructure and RecoveryGradeMethod Enums

**Files:**

- Create: `database/migrations/1781000000000_add_period_structure_and_recovery_grade_method_enums.ts`

**Step 1: Write the migration**

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PeriodStructure" AS ENUM ('BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "RecoveryGradeMethod" AS ENUM ('AVERAGE', 'REPLACE_IF_HIGHER', 'REPLACE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "RecoveryGradeMethod"')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PeriodStructure"')
  }
}
```

**Step 2: Run the migration**

Run: `node ace migration:run`
Expected: Migration runs without errors

**Step 3: Commit**

```bash
git add database/migrations/1781000000000_add_period_structure_and_recovery_grade_method_enums.ts
git commit -m "feat(subperiods): add PeriodStructure and RecoveryGradeMethod enums"
```

---

### Task 2: Add periodStructure and recoveryGradeMethod to School

**Files:**

- Modify: `app/models/school.ts`
- Modify: `app/validators/school.ts`
- Create: `database/migrations/1781000001000_add_period_structure_to_school_table.ts`

**Step 1: Write the migration**

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'School'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('periodStructure', '"PeriodStructure"').nullable()
      table
        .specificType('recoveryGradeMethod', '"RecoveryGradeMethod"')
        .nullable()
        .defaultTo('AVERAGE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('periodStructure')
      table.dropColumn('recoveryGradeMethod')
    })
  }
}
```

**Step 2: Run the migration**

Run: `node ace migration:run`
Expected: Migration runs, existing schools have null periodStructure (no sub-periods)

**Step 3: Update School model**

Add to `app/models/school.ts`:

- Add type exports after imports:

```ts
export type PeriodStructure = 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL'
export type RecoveryGradeMethod = 'AVERAGE' | 'REPLACE_IF_HIGHER' | 'REPLACE'
```

- Add column declarations:

```ts
@column({ columnName: 'periodStructure' })
declare periodStructure: PeriodStructure | null

@column({ columnName: 'recoveryGradeMethod' })
declare recoveryGradeMethod: RecoveryGradeMethod | null
```

**Step 4: Update School validator**

Add to `app/validators/school.ts` in `createSchoolValidator` and `updateSchoolValidator`:

```ts
periodStructure: vine.enum(['BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL'] as const).optional().nullable(),
recoveryGradeMethod: vine.enum(['AVERAGE', 'REPLACE_IF_HIGHER', 'REPLACE'] as const).optional().nullable(),
```

**Step 5: Run tests to verify nothing broke**

Run: `node ace test`
Expected: All existing tests pass

**Step 6: Commit**

```bash
git add app/models/school.ts app/validators/school.ts database/migrations/1781000001000_add_period_structure_to_school_table.ts
git commit -m "feat(subperiods): add periodStructure and recoveryGradeMethod to School"
```

---

### Task 3: Create AcademicSubPeriod Model and Table

**Files:**

- Create: `database/migrations/1781000002000_create_academic_sub_period_table.ts`
- Create: `app/models/academic_sub_period.ts`

**Step 1: Write the migration**

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AcademicSubPeriod'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable()
      table.integer('order').notNullable()
      table.date('startDate').notNullable()
      table.date('endDate').notNullable()
      table.float('weight', 8).notNullable().defaultTo(1)
      table.float('minimumGrade', 8).nullable()
      table.boolean('hasRecovery').notNullable().defaultTo(false)
      table.date('recoveryStartDate').nullable()
      table.date('recoveryEndDate').nullable()
      table
        .text('academicPeriodId')
        .notNullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable()
      table.index(['academicPeriodId'])
      table.index(['schoolId'])
      table.index(['academicPeriodId', 'order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run the migration**

Run: `node ace migration:run`
Expected: Table created successfully

**Step 3: Create the model**

Create `app/models/academic_sub_period.ts`:

```ts
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import AcademicPeriod from './academic_period.js'
import Exam from './exam.js'
import Assignment from './assignment.js'

export default class AcademicSubPeriod extends BaseModel {
  static table = 'AcademicSubPeriod'

  @beforeCreate()
  static assignId(subPeriod: AcademicSubPeriod) {
    if (!subPeriod.id) {
      subPeriod.id = uuidv7()
    }
  }

  @beforeCreate()
  static async generateSlug(subPeriod: AcademicSubPeriod) {
    if (!subPeriod.slug) {
      subPeriod.slug = subPeriod.name
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  declare slug: string

  @column({ columnName: 'order' })
  declare order: number

  @column.date({ columnName: 'startDate' })
  declare startDate: DateTime

  @column.date({ columnName: 'endDate' })
  declare endDate: DateTime

  @column({ columnName: 'weight' })
  declare weight: number

  @column({ columnName: 'minimumGrade' })
  declare minimumGrade: number | null

  @column({ columnName: 'hasRecovery' })
  declare hasRecovery: boolean

  @column.date({ columnName: 'recoveryStartDate' })
  declare recoveryStartDate: DateTime | null

  @column.date({ columnName: 'recoveryEndDate' })
  declare recoveryEndDate: DateTime | null

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @hasMany(() => Exam, { foreignKey: 'subPeriodId' })
  declare exams: HasMany<typeof Exam>

  @hasMany(() => Assignment, { foreignKey: 'subPeriodId' })
  declare assignments: HasMany<typeof Assignment>
}
```

**Step 4: Run Adonis to verify model loads**

Run: `node ace build --production 2>&1 | head -5`
Expected: No errors

**Step 5: Commit**

```bash
git add database/migrations/1781000002000_create_academic_sub_period_table.ts app/models/academic_sub_period.ts
git commit -m "feat(subperiods): create AcademicSubPeriod model and table"
```

---

### Task 4: Add subPeriodId to Exam and Assignment

**Files:**

- Create: `database/migrations/1781000003000_add_sub_period_id_to_exams_and_assignments.ts`
- Modify: `app/models/exam.ts`
- Modify: `app/models/assignment.ts`

**Step 1: Write the migration**

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('subPeriodId')
        .nullable()
        .references('id')
        .inTable('AcademicSubPeriod')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['subPeriodId'])
    })

    this.schema.alterTable('Assignment', (table) => {
      table
        .text('subPeriodId')
        .nullable()
        .references('id')
        .inTable('AcademicSubPeriod')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['subPeriodId'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['subPeriodId'])
      table.dropColumn('subPeriodId')
    })

    this.schema.alterTable('Assignment', (table) => {
      table.dropIndex(['subPeriodId'])
      table.dropColumn('subPeriodId')
    })
  }
}
```

**Step 2: Run the migration**

Run: `node ace migration:run`
Expected: Columns added, existing rows get null subPeriodId (backward compatible)

**Step 3: Update Exam model**

Add to `app/models/exam.ts`:

```ts
import AcademicSubPeriod from './academic_sub_period.js'

// In the class:
@column({ columnName: 'subPeriodId' })
declare subPeriodId: string | null

@belongsTo(() => AcademicSubPeriod, { foreignKey: 'subPeriodId' })
declare subPeriod: BelongsTo<typeof AcademicSubPeriod> | null
```

**Step 4: Update Assignment model**

Add to `app/models/assignment.ts`:

```ts
import AcademicSubPeriod from './academic_sub_period.js'

// In the class:
@column({ columnName: 'subPeriodId' })
declare subPeriodId: string | null

@belongsTo(() => AcademicSubPeriod, { foreignKey: 'subPeriodId' })
declare subPeriod: BelongsTo<typeof AcademicSubPeriod> | null
```

**Step 5: Run tests to verify nothing broke**

Run: `node ace test`
Expected: All existing tests pass (subPeriodId is nullable, no breaking changes)

**Step 6: Commit**

```bash
git add database/migrations/1781000003000_add_sub_period_id_to_exams_and_assignments.ts app/models/exam.ts app/models/assignment.ts
git commit -m "feat(subperiods): add nullable subPeriodId to Exam and Assignment"
```

---

### Task 5: Add Recovery Grade Fields to ExamGrade and StudentHasAssignment

**Files:**

- Create: `database/migrations/1781000004000_add_recovery_grade_fields.ts`
- Modify: `app/models/exam_grade.ts`
- Modify: `app/models/student_has_assignment.ts`

**Step 1: Write the migration**

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('exam_grades', (table) => {
      table.float('recoveryGrade', 8).nullable()
      table.timestamp('recoveryGradeDate').nullable()
    })

    this.schema.alterTable('StudentHasAssignment', (table) => {
      table.float('recoveryGrade', 8).nullable()
      table.timestamp('recoveryGradeDate').nullable()
    })
  }

  async down() {
    this.schema.alterTable('exam_grades', (table) => {
      table.dropColumn('recoveryGrade')
      table.dropColumn('recoveryGradeDate')
    })

    this.schema.alterTable('StudentHasAssignment', (table) => {
      table.dropColumn('recoveryGrade')
      table.dropColumn('recoveryGradeDate')
    })
  }
}
```

**Step 2: Run the migration**

Run: `node ace migration:run`
Expected: Columns added successfully

**Step 3: Update ExamGrade model**

Add to `app/models/exam_grade.ts`:

```ts
@column({ columnName: 'recoveryGrade' })
declare recoveryGrade: number | null

@column.dateTime({ columnName: 'recoveryGradeDate' })
declare recoveryGradeDate: DateTime | null
```

**Step 4: Update StudentHasAssignment model**

Add to `app/models/student_has_assignment.ts`:

```ts
@column({ columnName: 'recoveryGrade' })
declare recoveryGrade: number | null

@column.dateTime({ columnName: 'recoveryGradeDate' })
declare recoveryGradeDate: DateTime | null
```

**Step 5: Run tests to verify nothing broke**

Run: `node ace test`
Expected: All existing tests pass

**Step 6: Commit**

```bash
git add database/migrations/1781000004000_add_recovery_grade_fields.ts app/models/exam_grade.ts app/models/student_has_assignment.ts
git commit -m "feat(subperiods): add recoveryGrade and recoveryGradeDate to ExamGrade and StudentHasAssignment"
```

---

### Task 6: Add AcademicSubPeriod Relationship to AcademicPeriod

**Files:**

- Modify: `app/models/academic_period.ts`

**Step 1: Add the hasMany relationship**

Add to `app/models/academic_period.ts`:

```ts
import AcademicSubPeriod from './academic_sub_period.js'

// In the class:
@hasMany(() => AcademicSubPeriod, { foreignKey: 'academicPeriodId' })
declare subPeriods: HasMany<typeof AcademicSubPeriod>
```

**Step 2: Commit**

```bash
git add app/models/academic_period.ts
git commit -m "feat(subperiods): add subPeriods relationship to AcademicPeriod"
```

---

### Task 7: Create AcademicSubPeriod Validators

**Files:**

- Create: `app/validators/academic_sub_period.ts`

**Step 1: Write the validator**

```ts
import vine from '@vinejs/vine'

export const listAcademicSubPeriodsValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().uuid().optional(),
    page: vine.number().min(1).optional(),
    perPage: vine.number().min(1).max(100).optional(),
  })
)

export const createAcademicSubPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    order: vine.number().min(1).max(12),
    startDate: vine.date(),
    endDate: vine.date().after('startDate'),
    weight: vine.number().min(0).max(10).optional(),
    minimumGrade: vine.number().min(0).max(10).optional().nullable(),
    hasRecovery: vine.boolean().optional(),
    recoveryStartDate: vine.date().optional().nullable(),
    recoveryEndDate: vine.date().optional().nullable(),
    academicPeriodId: vine.string().uuid(),
    schoolId: vine.string().uuid(),
  })
)

export const updateAcademicSubPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    order: vine.number().min(1).max(12).optional(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    weight: vine.number().min(0).max(10).optional(),
    minimumGrade: vine.number().min(0).max(10).optional().nullable(),
    hasRecovery: vine.boolean().optional(),
    recoveryStartDate: vine.date().optional().nullable(),
    recoveryEndDate: vine.date().optional().nullable(),
  })
)

export const generateSubPeriodsValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().uuid(),
    schoolId: vine.string().uuid(),
  })
)
```

**Step 2: Commit**

```bash
git add app/validators/academic_sub_period.ts
git commit -m "feat(subperiods): create AcademicSubPeriod validators"
```

---

### Task 8: Create AcademicSubPeriod Transformer

**Files:**

- Create: `app/transformers/academic_sub_period_transformer.ts`

**Step 1: Write the transformer**

Look at an existing transformer in `app/transformers/` for the exact pattern (e.g., `academic_period_transformer.ts`), then create `academic_sub_period_transformer.ts` following the same pattern with these fields:

- id, name, slug, order, startDate, endDate, weight, minimumGrade, hasRecovery, recoveryStartDate, recoveryEndDate, academicPeriodId, schoolId, createdAt, updatedAt

**Step 2: Commit**

```bash
git add app/transformers/academic_sub_period_transformer.ts
git commit -m "feat(subperiods): create AcademicSubPeriod transformer"
```

---

### Task 9: Create AcademicSubPeriod Controllers

**Files:**

- Create: `app/controllers/academic_sub_periods/index.ts`
- Create: `app/controllers/academic_sub_periods/show.ts`
- Create: `app/controllers/academic_sub_periods/store.ts`
- Create: `app/controllers/academic_sub_periods/update.ts`
- Create: `app/controllers/academic_sub_periods/destroy.ts`
- Create: `app/controllers/academic_sub_periods/generate_controller.ts`

**Step 1: Create index controller**

Follow the pattern from `app/controllers/academic_periods/index.ts` but filter by `academicPeriodId` and `schoolId`.

**Step 2: Create show controller**

Follow the pattern from `app/controllers/academic_periods/show.ts`.

**Step 3: Create store controller**

Follow the pattern from `app/controllers/academic_periods/store.ts` with validation using `createAcademicSubPeriodValidator`.

**Step 4: Create update controller**

Follow the pattern from `app/controllers/academic_periods/update.ts` with validation using `updateAcademicSubPeriodValidator`.

**Step 5: Create destroy controller**

Follow the pattern from `app/controllers/academic_periods/destroy.ts` with soft-delete.

**Step 6: Create generate controller**

This controller handles the "generate sub-periods" feature:

- Accept `academicPeriodId` and `schoolId`
- Load the AcademicPeriod and School
- Verify School has `periodStructure` configured
- Calculate sub-period dates by dividing the period evenly
- Create AcademicSubPeriod records with generated names and dates
- Return created sub-periods

Logic for date splitting:

```
BIMESTRAL: period total days / 4
TRIMESTRAL: period total days / 3
SEMESTRAL: period total days / 2
```

Names: "1º Bimestre", "2º Bimestre" etc. (or "Trimestre"/"Semestre" based on periodStructure).

**Step 7: Commit**

```bash
git add app/controllers/academic_sub_periods/
git commit -m "feat(subperiods): create AcademicSubPeriod controllers"
```

---

### Task 10: Add Routes for AcademicSubPeriod

**Files:**

- Create: `start/routes/api/academic_sub_periods.ts`
- Modify: `start/routes.ts` (or wherever routes are bootstrapped)

**Step 1: Write the routes file**

```ts
import router from '@adonisjs/core/services/router'

const IndexController = () => import('#controllers/academic_sub_periods/index')
const ShowController = () => import('#controllers/academic_sub_periods/show')
const StoreController = () => import('#controllers/academic_sub_periods/store')
const UpdateController = () => import('#controllers/academic_sub_periods/update')
const DestroyController = () => import('#controllers/academic_sub_periods/destroy')
const GenerateController = () => import('#controllers/academic_sub_periods/generate_controller')

export default function academicSubPeriodRoutes() {
  router
    .group(() => {
      router.get('/', [IndexController])
      router.get('/:id', [ShowController])
      router.post('/', [StoreController])
      router.post('/generate', [GenerateController])
      router.put('/:id', [UpdateController])
      router.delete('/:id', [DestroyController])
    })
    .prefix('/academic-sub-periods')
}
```

**Step 2: Register in main routes**

Add the import and call to the main routes file (following how other route files like `schools.ts` are registered).

**Step 3: Commit**

```bash
git add start/routes/api/academic_sub_periods.ts start/routes.ts
git commit -m "feat(subperiods): add AcademicSubPeriod routes"
```

---

### Task 11: Update Exam/Assignment Validators for subPeriodId

**Files:**

- Modify: `app/validators/exam.ts`
- Modify: `app/validators/assignment.ts`

**Step 1: Update exam validator**

Add to `createExamValidator` and `updateExamValidator`:

```ts
subPeriodId: vine.string().uuid().optional().nullable(),
```

**Step 2: Update assignment validator**

Add to `createAssignmentValidator` and `updateAssignmentValidator`:

```ts
subPeriodId: vine.string().uuid().optional().nullable(),
```

**Step 3: Commit**

```bash
git add app/validators/exam.ts app/validators/assignment.ts
git commit -m "feat(subperiods): add subPeriodId to exam and assignment validators"
```

---

### Task 12: Update ExamGrade/StudentHasAssignment Validators for Recovery Grade

**Files:**

- Modify: `app/validators/exam_grade.ts` (or whatever the exam grade validator is named)
- Modify: `app/validators/student_has_assignment.ts` (or equivalent)

**Step 1: Add recovery grade fields to validators**

Add to the relevant validators:

```ts
recoveryGrade: vine.number().min(0).max(10).optional().nullable(),
recoveryGradeDate: vine.date().optional().nullable(),
```

**Step 2: Commit**

```bash
git add app/validators/
git commit -m "feat(subperiods): add recoveryGrade fields to grade validators"
```

---

### Task 13: Write Tests for AcademicSubPeriod CRUD

**Files:**

- Create: `tests/functional/academic_sub_periods_api.spec.ts`

**Step 1: Write the test file**

Create comprehensive tests following the existing pattern from `tests/functional/escola/students_api.spec.ts`:

1. Test: unauthenticated request redirects to login
2. Test: create a sub-period (happy path)
3. Test: list sub-periods filtered by academicPeriodId
4. Test: show a single sub-period
5. Test: update a sub-period
6. Test: soft-delete a sub-period
7. Test: generate sub-periods from periodStructure BIMESTRAL
8. Test: generate sub-periods fails without periodStructure on school
9. Test: cannot create sub-period with endDate before startDate
10. Test: weight defaults to 1

**Step 2: Run tests**

Run: `node ace test --files="tests/functional/academic_sub_periods_api.spec.ts"`
Expected: All tests pass

**Step 3: Commit**

```bash
git add tests/functional/academic_sub_periods_api.spec.ts
git commit -m "test(subperiods): add CRUD tests for AcademicSubPeriod"
```

---

### Task 14: Update Grade Calculation Logic for Sub-Periods

**Files:**

- Find the current grade calculation service/controller (likely in `app/controllers/` or `app/services/`)
- Create: `app/services/sub_period_grade_calculator.ts`

**Step 1: Read existing grade calculation**

Search for the current student status/grade calculation logic (get student status controller) and understand how `finalGrade` is calculated today.

**Step 2: Create the sub-period grade calculator service**

```ts
import AcademicSubPeriod from '#models/academic_sub_period'
import Exam from '#models/exam'
import Assignment from '#models/assignment'
import School from '#models/school'
import type { PeriodStructure } from '#models/school'

export type SubPeriodGrade = {
  subPeriodId: string
  subPeriodName: string
  order: number
  grade: number | null
  recoveryGrade: number | null
  finalGrade: number | null
  weight: number
  minimumGrade: number
  hasRecovery: boolean
  status: 'APPROVED' | 'IN_RECOVERY' | 'RECOVERED' | 'FAILED' | 'NO_GRADE'
}

export type PeriodGradeResult = {
  subPeriodGrades: SubPeriodGrade[]
  finalGrade: number | null
  isApproved: boolean | null
}

export class SubPeriodGradeCalculator {
  static async calculateForStudent(
    school: School,
    academicPeriodId: string,
    studentId: string,
    subjectId?: string,
    classId?: string
  ): Promise<PeriodGradeResult | null> {
    if (!school.periodStructure) {
      return null
    }

    const subPeriods = await AcademicSubPeriod.query()
      .where('academicPeriodId', academicPeriodId)
      .where('schoolId', school.id)
      .orderBy('order', 'asc')

    if (subPeriods.length === 0) {
      return null
    }

    const subPeriodGrades: SubPeriodGrade[] = []
    const minimumGrade = school.minimumGrade
    const recoveryMethod = school.recoveryGradeMethod || 'AVERAGE'

    for (const subPeriod of subPeriods) {
      const grade = await this.calculateSubPeriodGrade(
        subPeriod.id,
        studentId,
        subjectId,
        classId,
        school.calculationAlgorithm || 'AVERAGE'
      )

      const effectiveMinimumGrade = subPeriod.minimumGrade ?? minimumGrade
      const recoveryGrade = await this.getRecoveryGrade(subPeriod.id, studentId, subjectId, classId)
      const finalGrade = this.applyRecovery(grade, recoveryGrade, recoveryMethod)

      let status: SubPeriodGrade['status'] = 'NO_GRADE'
      if (finalGrade !== null) {
        if (finalGrade >= effectiveMinimumGrade) {
          status =
            grade !== null && grade < effectiveMinimumGrade && recoveryGrade !== null
              ? 'RECOVERED'
              : 'APPROVED'
        } else if (subPeriod.hasRecovery && recoveryGrade === null) {
          status = 'IN_RECOVERY'
        } else {
          status = 'FAILED'
        }
      }

      subPeriodGrades.push({
        subPeriodId: subPeriod.id,
        subPeriodName: subPeriod.name,
        order: subPeriod.order,
        grade,
        recoveryGrade,
        finalGrade,
        weight: subPeriod.weight,
        minimumGrade: effectiveMinimumGrade,
        hasRecovery: subPeriod.hasRecovery,
        status,
      })
    }

    const finalGrade = this.calculateFinalGrade(subPeriodGrades)
    const isApproved = finalGrade !== null ? finalGrade >= minimumGrade : null

    return { subPeriodGrades, finalGrade, isApproved }
  }

  private static async calculateSubPeriodGrade(
    subPeriodId: string,
    studentId: string,
    subjectId?: string,
    classId?: string,
    algorithm: string = 'AVERAGE'
  ): Promise<number | null> {
    // Query exams and assignments for this sub-period
    // Calculate based on school's calculationAlgorithm
    // This should follow the existing pattern in the grade calculation logic
    // Returns null if no grades exist for this sub-period
    return null // placeholder - implement based on existing grade calculation pattern
  }

  private static async getRecoveryGrade(
    subPeriodId: string,
    studentId: string,
    subjectId?: string,
    classId?: string
  ): Promise<number | null> {
    // Query recovery grades from ExamGrade and StudentHasAssignment
    // for exams/assignments in this sub-period
    return null // placeholder - implement based on existing pattern
  }

  private static applyRecovery(
    originalGrade: number | null,
    recoveryGrade: number | null,
    method: string
  ): number | null {
    if (originalGrade === null) return null
    if (recoveryGrade === null) return originalGrade

    switch (method) {
      case 'AVERAGE':
        return (originalGrade + recoveryGrade) / 2
      case 'REPLACE_IF_HIGHER':
        return Math.max(originalGrade, recoveryGrade)
      case 'REPLACE':
        return recoveryGrade
      default:
        return originalGrade
    }
  }

  private static calculateFinalGrade(subPeriodGrades: SubPeriodGrade[]): number | null {
    const gradedPeriods = subPeriodGrades.filter((sp) => sp.finalGrade !== null)
    if (gradedPeriods.length === 0) return null

    const totalWeight = gradedPeriods.reduce((sum, sp) => sum + sp.weight, 0)
    if (totalWeight === 0) return null

    const weightedSum = gradedPeriods.reduce((sum, sp) => sum + sp.finalGrade! * sp.weight, 0)
    return weightedSum / totalWeight
  }
}
```

**Step 3: Commit**

```bash
git add app/services/sub_period_grade_calculator.ts
git commit -m "feat(subperiods): add SubPeriodGradeCalculator service"
```

---

### Task 15: Integrate Sub-Period Grade Calculation into Student Status

**Files:**

- Modify: the existing student status/grade calculation controller
- This task requires understanding the exact existing implementation first

**Step 1: Read the existing student status controller**

Find and read the controller that calculates `finalGrade` and student status (likely `GetStudentStatusController` or similar).

**Step 2: Integrate bifurcated logic**

In the existing grade calculation:

- Check if `school.periodStructure` is set
- If YES: use `SubPeriodGradeCalculator.calculateForStudent()` which returns sub-period grades and weighted final grade
- If NO: keep the existing calculation as-is (backward compatible)

This is the critical backward-compatibility point. The existing calculation must remain unchanged for schools without `periodStructure`.

**Step 3: Write tests for the integration**

Test that:

- Schools without `periodStructure` still calculate grades the old way
- Schools with `periodStructure` calculate using sub-period weighted average

**Step 4: Commit**

```bash
git add app/controllers/ app/services/
git commit -m "feat(subperiods): integrate sub-period grade calculation into student status"
```

---

### Task 16: Update Frontend - School Settings for PeriodStructure

**Files:**

- Find the school settings/edit page in the frontend (likely in `inertia/pages/`)
- Add periodStructure and recoveryGradeMethod fields to the school settings form

**Step 1: Find the school settings page**

Search for the school settings/edit page in the frontend codebase.

**Step 2: Add the period structure configuration UI**

Add a dropdown/select for `periodStructure`:

- Options: Bimestral (4 períodos), Trimestral (3 períodos), Semestral (2 períodos), Não usar sub-períodos (null)

Add a dropdown/select for `recoveryGradeMethod`:

- Options: Média (AVERAGE), Substituir se maior (REPLACE_IF_HIGHER), Substituir (REPLACE)

**Step 3: Commit**

```bash
git add inertia/
git commit -m "feat(subperiods): add periodStructure and recoveryGradeMethod to school settings UI"
```

---

### Task 17: Update Frontend - Sub-Period Management in Academic Period

**Files:**

- Find the academic period show/edit page in the frontend
- Add sub-period management UI

**Step 1: Find the academic period page**

Search for the academic period management page in the frontend.

**Step 2: Add sub-period management to academic period detail**

When school has `periodStructure`:

- Show a button "Gerar sub-períodos" that calls the generate endpoint
- Show a list/table of sub-periods with: name, order, dates, weight, minimum grade, has recovery
- Allow editing individual sub-periods
- Allow editing dates for each sub-period

**Step 3: Commit**

```bash
git add inertia/
git commit -m "feat(subperiods): add sub-period management UI to academic period"
```

---

### Task 18: Update Frontend - Exam and Assignment Forms with Sub-Period Select

**Files:**

- Find the exam and assignment create/edit pages in the frontend
- Add sub-period dropdown

**Step 1: Find exam and assignment form pages**

Search for the exam and assignment create/edit pages.

**Step 2: Add sub-period selector**

When school has `periodStructure`:

- Add a dropdown showing sub-periods of the current academic period
- Pre-select the current sub-period based on today's date
- Make it optional (nullable) for backward compatibility

**Step 3: Commit**

```bash
git add inertia/
git commit -m "feat(subperiods): add sub-period selector to exam and assignment forms"
```

---

### Task 19: Update Frontend - Report Card / Grades View with Sub-Periods

**Files:**

- Find the grades/report card pages in the frontend
- Update to show grades organized by sub-period when applicable

**Step 1: Find the grade/report card views**

Search for grade display and student status pages.

**Step 2: Update the grade display**

When school has `periodStructure`:

- Show grades organized by sub-period (tabs or sections: 1º Bimestre, 2º Bimestre, etc.)
- Show sub-period grades with recovery grades
- Show the weighted final average at the bottom
- Show sub-period status (APPROVED, IN_RECOVERY, RECOVERED, FAILED)

When school does NOT have `periodStructure`:

- Keep the existing display unchanged

**Step 3: Commit**

```bash
git add inertia/
git commit -m "feat(subperiods): update grade display to organize by sub-periods"
```

---

### Task 20: Final Integration Test

**Step 1: Run all tests**

Run: `node ace test`
Expected: All tests pass

**Step 2: Manual smoke test**

1. Configure a school with `periodStructure: BIMESTRAL`
2. Create an academic period for that school
3. Generate sub-periods
4. Create exams in each sub-period
5. Verify grade calculation uses weighted average
6. Verify backward compatibility with a school that has no `periodStructure`

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(subperiods): sub-period grade system complete"
```
