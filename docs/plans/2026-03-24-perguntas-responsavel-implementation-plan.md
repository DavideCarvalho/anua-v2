# Perguntas do Responsável - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir que responsáveis enviem perguntas sobre seus filhos para a escola (professores, coordenação e direção) e recebam respostas de forma assíncrona.

**Architecture:** Sistema dedicado de "Perguntas" (ParentInquiry) separado do sistema de comunicados. Cada pergunta é vinculada a um aluno específico e roteada automaticamente para todos os destinatários relevantes.

**Tech Stack:** AdonisJS (Lucid ORM), React (Inertia), TanStack Query, shadcn/ui, @jrmc/adonis-attachment (anexos), @adonisjs/mail (notificações)

---

## Task 1: Create Database Migrations

**Files:**

- Create: `database/migrations/XXXXXXXXXXXXX_create_parent_inquiries_tables.ts`

**Step 1: Create migration file for ParentInquiry**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('createdByResponsibleId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('subject').notNullable()
      table.text('status').notNullable().defaultTo('OPEN')
      table.timestamp('resolvedAt').nullable()
      table
        .text('resolvedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable().defaultTo(this.now())

      table.index(['studentId'])
      table.index(['schoolId'])
      table.index(['status'])
      table.index(['createdByResponsibleId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: Migration executed successfully

**Step 3: Commit**

```bash
git add database/migrations/*
git commit -m "feat: add ParentInquiry table migration"
```

---

## Task 2: Create ParentInquiryMessage Table

**Files:**

- Create: `database/migrations/XXXXXXXXXXXXX_create_parent_inquiry_messages_table.ts`

**Step 1: Create migration file**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryMessage'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('inquiryId')
        .notNullable()
        .references('id')
        .inTable('ParentInquiry')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('authorId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('authorType').notNullable()
      table.text('body').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable().defaultTo(this.now())

      table.index(['inquiryId'])
      table.index(['authorId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`

**Step 3: Commit**

```bash
git add database/migrations/*
git commit -m "feat: add ParentInquiryMessage table migration"
```

---

## Task 3: Create ParentInquiryAttachment Table

**Files:**

- Create: `database/migrations/XXXXXXXXXXXXX_create_parent_inquiry_attachments_table.ts`

**Step 1: Create migration file**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryAttachment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('messageId')
        .notNullable()
        .references('id')
        .inTable('ParentInquiryMessage')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('fileName').notNullable()
      table.text('filePath').notNullable()
      table.integer('fileSize').notNullable()
      table.text('mimeType').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['messageId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`

**Step 3: Commit**

```bash
git add database/migrations/*
git commit -m "feat: add ParentInquiryAttachment table migration"
```

---

## Task 4: Create ParentInquiryRecipient Table

**Files:**

- Create: `database/migrations/XXXXXXXXXXXXX_create_parent_inquiry_recipients_table.ts`

**Step 1: Create migration file**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryRecipient'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('inquiryId')
        .notNullable()
        .references('id')
        .inTable('ParentInquiry')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('userType').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['inquiryId'])
      table.index(['userId'])
      table.unique(['inquiryId', 'userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`

**Step 3: Commit**

```bash
git add database/migrations/*
git commit -m "feat: add ParentInquiryRecipient table migration"
```

---

## Task 5: Create ParentInquiry Model

**Files:**

- Create: `app/models/parent_inquiry.ts`

**Step 1: Create model file**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'
import School from './school.js'
import ParentInquiryMessage from './parent_inquiry_message.js'
import ParentInquiryRecipient from './parent_inquiry_recipient.js'

export type InquiryStatus = 'OPEN' | 'RESOLVED' | 'CLOSED'

export default class ParentInquiry extends BaseModel {
  static table = 'ParentInquiry'

  @beforeCreate()
  static assignId(model: ParentInquiry) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare createdByResponsibleId: string

  @column()
  declare schoolId: string

  @column()
  declare subject: string

  @column()
  declare status: InquiryStatus

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @column()
  declare resolvedBy: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'createdByResponsibleId' })
  declare createdByResponsible: BelongsTo<typeof User>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'resolvedBy' })
  declare resolvedByUser: BelongsTo<typeof User>

  @hasMany(() => ParentInquiryMessage, { foreignKey: 'inquiryId' })
  declare messages: HasMany<typeof ParentInquiryMessage>

  @hasMany(() => ParentInquiryRecipient, { foreignKey: 'inquiryId' })
  declare recipients: HasMany<typeof ParentInquiryRecipient>
}
```

**Step 2: Commit**

```bash
git add app/models/parent_inquiry.ts
git commit -m "feat: add ParentInquiry model"
```

---

## Task 6: Create ParentInquiryMessage Model

**Files:**

- Create: `app/models/parent_inquiry_message.ts`

**Step 1: Create model file**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ParentInquiry from './parent_inquiry.js'
import User from './user.js'
import ParentInquiryAttachment from './parent_inquiry_attachment.js'

export type AuthorType = 'RESPONSIBLE' | 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'

export default class ParentInquiryMessage extends BaseModel {
  static table = 'ParentInquiryMessage'

  @beforeCreate()
  static assignId(model: ParentInquiryMessage) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare inquiryId: string

  @column()
  declare authorId: string

  @column()
  declare authorType: AuthorType

  @column()
  declare body: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ParentInquiry, { foreignKey: 'inquiryId' })
  declare inquiry: BelongsTo<typeof ParentInquiry>

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @hasMany(() => ParentInquiryAttachment, { foreignKey: 'messageId' })
  declare attachments: HasMany<typeof ParentInquiryAttachment>
}
```

**Step 2: Commit**

```bash
git add app/models/parent_inquiry_message.ts
git commit -m "feat: add ParentInquiryMessage model"
```

---

## Task 7: Create ParentInquiryAttachment Model

**Files:**

- Create: `app/models/parent_inquiry_attachment.ts`

**Step 1: Create model file**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ParentInquiryMessage from './parent_inquiry_message.js'

export default class ParentInquiryAttachment extends BaseModel {
  static table = 'ParentInquiryAttachment'

  @beforeCreate()
  static assignId(model: ParentInquiryAttachment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare messageId: string

  @column()
  declare fileName: string

  @column()
  declare filePath: string

  @column()
  declare fileSize: number

  @column()
  declare mimeType: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => ParentInquiryMessage, { foreignKey: 'messageId' })
  declare message: BelongsTo<typeof ParentInquiryMessage>
}
```

**Step 2: Commit**

```bash
git add app/models/parent_inquiry_attachment.ts
git commit -m "feat: add ParentInquiryAttachment model"
```

---

## Task 8: Create ParentInquiryRecipient Model

**Files:**

- Create: `app/models/parent_inquiry_recipient.ts`

**Step 1: Create model file**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ParentInquiry from './parent_inquiry.js'
import User from './user.js'

export type RecipientType = 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'

export default class ParentInquiryRecipient extends BaseModel {
  static table = 'ParentInquiryRecipient'

  @beforeCreate()
  static assignId(model: ParentInquiryRecipient) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare inquiryId: string

  @column()
  declare userId: string

  @column()
  declare userType: RecipientType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => ParentInquiry, { foreignKey: 'inquiryId' })
  declare inquiry: BelongsTo<typeof ParentInquiry>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
```

**Step 2: Commit**

```bash
git add app/models/parent_inquiry_recipient.ts
git commit -m "feat: add ParentInquiryRecipient model"
```

---

## Task 9: Create Recipient Resolution Service

**Files:**

- Create: `app/services/inquiries/inquiry_recipient_service.ts`

**Step 1: Create service file**

```typescript
import User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import TeacherHasClass from '#models/teacher_has_class'
import CoordinatorHasLevel from '#models/coordinator_has_level'
import Role from '#models/role'
import type { RecipientType } from '#models/parent_inquiry_recipient'

export interface InquiryRecipient {
  userId: string
  userType: RecipientType
}

export async function resolveInquiryRecipients(
  studentId: string,
  schoolId: string
): Promise<InquiryRecipient[]> {
  const recipients: InquiryRecipient[] = []
  const addedUserIds = new Set<string>()

  // 1. Get student's active enrollment
  const enrollment = await StudentHasLevel.query()
    .where('studentId', studentId)
    .whereNull('deletedAt')
    .preload('class')
    .preload('level')
    .first()

  if (!enrollment) {
    return recipients
  }

  // 2. Get teachers from the student's class
  if (enrollment.classId) {
    const teacherClasses = await TeacherHasClass.query()
      .where('classId', enrollment.classId)
      .where('isActive', true)
      .select(['teacherId'])

    for (const tc of teacherClasses) {
      if (!addedUserIds.has(tc.teacherId)) {
        recipients.push({
          userId: tc.teacherId,
          userType: 'TEACHER',
        })
        addedUserIds.add(tc.teacherId)
      }
    }
  }

  // 3. Get coordinators for the student's level
  if (enrollment.levelAssignedToCourseHasAcademicPeriodId) {
    const coordinatorLinks = await CoordinatorHasLevel.query()
      .where(
        'levelAssignedToCourseHasAcademicPeriodId',
        enrollment.levelAssignedToCourseHasAcademicPeriodId
      )
      .select(['coordinatorId'])

    for (const link of coordinatorLinks) {
      if (!addedUserIds.has(link.coordinatorId)) {
        recipients.push({
          userId: link.coordinatorId,
          userType: 'COORDINATOR',
        })
        addedUserIds.add(link.coordinatorId)
      }
    }
  }

  // 4. Get directors from the school
  const directorRole = await Role.findBy('name', 'SCHOOL_DIRECTOR')
  if (directorRole) {
    const directors = await User.query()
      .where('schoolId', schoolId)
      .where('roleId', directorRole.id)
      .where('active', true)
      .select(['id'])

    for (const director of directors) {
      if (!addedUserIds.has(director.id)) {
        recipients.push({
          userId: director.id,
          userType: 'DIRECTOR',
        })
        addedUserIds.add(director.id)
      }
    }
  }

  return recipients
}
```

**Step 2: Commit**

```bash
git add app/services/inquiries/inquiry_recipient_service.ts
git commit -m "feat: add inquiry recipient resolution service"
```

---

## Task 10: Create Transformers

**Files:**

- Create: `app/transformers/parent_inquiry_transformer.ts`
- Create: `app/transformers/parent_inquiry_message_transformer.ts`
- Create: `app/transformers/parent_inquiry_attachment_transformer.ts`
- Create: `app/transformers/parent_inquiry_recipient_transformer.ts`

**Step 1: Create ParentInquiryTransformer**

```typescript
import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiry from '#models/parent_inquiry'
import UserTransformer from '#transformers/user_transformer'
import StudentTransformer from '#transformers/student_transformer'
import ParentInquiryMessageTransformer from '#transformers/parent_inquiry_message_transformer'
import ParentInquiryRecipientTransformer from '#transformers/parent_inquiry_recipient_transformer'

export default class ParentInquiryTransformer extends BaseTransformer<ParentInquiry> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'createdByResponsibleId',
        'schoolId',
        'subject',
        'status',
        'resolvedAt',
        'resolvedBy',
        'createdAt',
        'updatedAt',
      ]),
      createdByResponsible: UserTransformer.transform(
        this.whenLoaded(this.resource.createdByResponsible)
      ),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      resolvedByUser: UserTransformer.transform(this.whenLoaded(this.resource.resolvedByUser)),
      messages: ParentInquiryMessageTransformer.transform(this.whenLoaded(this.resource.messages)),
      recipients: ParentInquiryRecipientTransformer.transform(
        this.whenLoaded(this.resource.recipients)
      ),
    }
  }
}
```

**Step 2: Create ParentInquiryMessageTransformer**

```typescript
import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiryMessage from '#models/parent_inquiry_message'
import UserTransformer from '#transformers/user_transformer'
import ParentInquiryAttachmentTransformer from '#transformers/parent_inquiry_attachment_transformer'

export default class ParentInquiryMessageTransformer extends BaseTransformer<ParentInquiryMessage> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'inquiryId',
        'authorId',
        'authorType',
        'body',
        'createdAt',
        'updatedAt',
      ]),
      author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
      attachments: ParentInquiryAttachmentTransformer.transform(
        this.whenLoaded(this.resource.attachments)
      ),
    }
  }
}
```

**Step 3: Create ParentInquiryAttachmentTransformer**

```typescript
import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiryAttachment from '#models/parent_inquiry_attachment'

export default class ParentInquiryAttachmentTransformer extends BaseTransformer<ParentInquiryAttachment> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'messageId',
      'fileName',
      'filePath',
      'fileSize',
      'mimeType',
      'createdAt',
    ])
  }
}
```

**Step 4: Create ParentInquiryRecipientTransformer**

```typescript
import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import UserTransformer from '#transformers/user_transformer'

export default class ParentInquiryRecipientTransformer extends BaseTransformer<ParentInquiryRecipient> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'inquiryId', 'userId', 'userType', 'createdAt']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }
}
```

**Step 5: Commit**

```bash
git add app/transformers/parent_inquiry*.ts
git commit -m "feat: add parent inquiry transformers"
```

---

## Task 11: Create Validators

**Files:**

- Create: `app/validators/parent_inquiry.ts`

**Step 1: Create validator file**

```typescript
import vine from '@vinejs/vine'

export const createInquiryValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(3).maxLength(255),
    body: vine.string().trim().minLength(1),
    attachments: vine
      .array(
        vine.object({
          fileName: vine.string(),
          filePath: vine.string(),
          fileSize: vine.number(),
          mimeType: vine.string(),
        })
      )
      .optional()
      .nullable(),
  })
)

export const createMessageValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1),
    attachments: vine
      .array(
        vine.object({
          fileName: vine.string(),
          filePath: vine.string(),
          fileSize: vine.number(),
          mimeType: vine.string(),
        })
      )
      .optional()
      .nullable(),
  })
)

export const listInquiriesValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    status: vine.enum(['OPEN', 'RESOLVED', 'CLOSED', 'ALL']).optional(),
  })
)
```

**Step 2: Commit**

```bash
git add app/validators/parent_inquiry.ts
git commit -m "feat: add parent inquiry validators"
```

---

## Task 12: Create API Controller - List Inquiries (Responsável)

**Files:**

- Create: `app/controllers/responsavel/list_student_inquiries_controller.ts`

**Step 1: Create controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import { listInquiriesValidator } from '#validators/parent_inquiry'

export default class ListStudentInquiriesController {
  async handle({ request, response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { studentId } = params

    // Verify user is responsible for this student
    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não é responsável por este aluno')
    }

    const payload = await request.validateUsing(listInquiriesValidator)
    const page = payload.page || 1
    const limit = Math.min(payload.limit || 20, 100)

    const query = ParentInquiry.query()
      .where('studentId', studentId)
      .preload('createdByResponsible')
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
      })

    if (payload.status && payload.status !== 'ALL') {
      query.where('status', payload.status)
    }

    const result = await query.orderBy('createdAt', 'desc').paginate(page, limit)
    const data = result.all()
    const metadata = result.getMeta()

    return response.ok(await serialize(ParentInquiryTransformer.paginate(data, metadata)))
  }
}
```

**Step 2: Commit**

```bash
git add app/controllers/responsavel/list_student_inquiries_controller.ts
git commit -m "feat: add list student inquiries controller"
```

---

## Task 13: Create API Controller - Create Inquiry (Responsável)

**Files:**

- Create: `app/controllers/responsavel/create_student_inquiry_controller.ts`

**Step 1: Create controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import ParentInquiryAttachment from '#models/parent_inquiry_attachment'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import Student from '#models/student'
import { createInquiryValidator } from '#validators/parent_inquiry'
import { resolveInquiryRecipients } from '#services/inquiries/inquiry_recipient_service'

export default class CreateStudentInquiryController {
  async handle({ request, response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { studentId } = params

    // Verify user is responsible for this student
    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não é responsável por este aluno')
    }

    const student = await Student.find(studentId)
    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    const payload = await request.validateUsing(createInquiryValidator)

    // Get school from student's active enrollment
    const enrollment = await student.getActiveEnrollment()
    const schoolId = enrollment?.schoolId || student.schoolId

    if (!schoolId) {
      throw AppException.badRequest('Aluno não possui escola vinculada')
    }

    // Resolve recipients
    const recipients = await resolveInquiryRecipients(studentId, schoolId)

    const inquiry = await db.transaction(async (trx) => {
      const created = await ParentInquiry.create(
        {
          studentId,
          createdByResponsibleId: user.id,
          schoolId,
          subject: payload.subject,
          status: 'OPEN',
        },
        { client: trx }
      )

      // Create initial message
      const message = await ParentInquiryMessage.create(
        {
          inquiryId: created.id,
          authorId: user.id,
          authorType: 'RESPONSIBLE',
          body: payload.body,
        },
        { client: trx }
      )

      // Create attachments if provided
      if (payload.attachments && payload.attachments.length > 0) {
        await Promise.all(
          payload.attachments.map((att) =>
            ParentInquiryAttachment.create(
              {
                messageId: message.id,
                fileName: att.fileName,
                filePath: att.filePath,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              },
              { client: trx }
            )
          )
        )
      }

      // Create recipients
      await Promise.all(
        recipients.map((r) =>
          ParentInquiryRecipient.create(
            {
              inquiryId: created.id,
              userId: r.userId,
              userType: r.userType,
            },
            { client: trx }
          )
        )
      )

      return created
    })

    await inquiry.load('createdByResponsible')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    return response.created(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
```

**Step 2: Commit**

```bash
git add app/controllers/responsavel/create_student_inquiry_controller.ts
git commit -m "feat: add create student inquiry controller"
```

---

## Task 14: Create API Controller - Add Message (Responsável)

**Files:**

- Create: `app/controllers/responsavel/create_inquiry_message_controller.ts`

**Step 1: Create controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryAttachment from '#models/parent_inquiry_attachment'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import { createMessageValidator } from '#validators/parent_inquiry'

export default class CreateInquiryMessageController {
  async handle({ request, response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query().where('id', inquiryId).preload('student').first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    // Verify user is responsible for this student
    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', inquiry.studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não tem permissão para responder esta pergunta')
    }

    if (inquiry.status === 'RESOLVED' || inquiry.status === 'CLOSED') {
      throw AppException.badRequest('Esta pergunta já foi encerrada')
    }

    const payload = await request.validateUsing(createMessageValidator)

    const message = await db.transaction(async (trx) => {
      const created = await ParentInquiryMessage.create(
        {
          inquiryId: inquiry.id,
          authorId: user.id,
          authorType: 'RESPONSIBLE',
          body: payload.body,
        },
        { client: trx }
      )

      if (payload.attachments && payload.attachments.length > 0) {
        await Promise.all(
          payload.attachments.map((att) =>
            ParentInquiryAttachment.create(
              {
                messageId: created.id,
                fileName: att.fileName,
                filePath: att.filePath,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              },
              { client: trx }
            )
          )
        )
      }

      return created
    })

    await inquiry.load('createdByResponsible')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
```

**Step 2: Commit**

```bash
git add app/controllers/responsavel/create_inquiry_message_controller.ts
git commit -m "feat: add create inquiry message controller for responsavel"
```

---

## Task 15: Create API Controller - Resolve Inquiry

**Files:**

- Create: `app/controllers/responsavel/resolve_inquiry_controller.ts`
- Create: `app/controllers/escola/resolve_inquiry_controller.ts`

**Step 1: Create responsavel controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ResolveInquiryController {
  async handle({ response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.find(inquiryId)
    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    // Verify user is responsible for this student
    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', inquiry.studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não tem permissão para encerrar esta pergunta')
    }

    if (inquiry.status !== 'OPEN') {
      throw AppException.badRequest('Esta pergunta não pode ser encerrada')
    }

    inquiry.status = 'RESOLVED'
    inquiry.resolvedAt = DateTime.now()
    inquiry.resolvedBy = user.id
    await inquiry.save()

    await inquiry.load('createdByResponsible')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
```

**Step 2: Create escola controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'

export default class ResolveInquiryController {
  async handle({
    response,
    auth,
    effectiveUser,
    params,
    serialize,
    selectedSchoolIds,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.find(inquiryId)
    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(inquiry.schoolId)) {
      throw AppException.forbidden('Você não tem permissão para acessar esta pergunta')
    }

    if (inquiry.status !== 'OPEN') {
      throw AppException.badRequest('Esta pergunta não pode ser encerrada')
    }

    inquiry.status = 'RESOLVED'
    inquiry.resolvedAt = DateTime.now()
    inquiry.resolvedBy = user.id
    await inquiry.save()

    await inquiry.load('createdByResponsible')
    await inquiry.load('student')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
```

**Step 3: Commit**

```bash
git add app/controllers/responsavel/resolve_inquiry_controller.ts app/controllers/escola/resolve_inquiry_controller.ts
git commit -m "feat: add resolve inquiry controllers"
```

---

## Task 16: Create API Controller - List Inquiries (Escola)

**Files:**

- Create: `app/controllers/escola/list_inquiries_controller.ts`
- Create: `app/controllers/escola/show_inquiry_controller.ts`
- Create: `app/controllers/escola/create_inquiry_message_controller.ts`

**Step 1: Create list controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { listInquiriesValidator } from '#validators/parent_inquiry'

export default class ListInquiriesController {
  async handle({
    request,
    response,
    auth,
    effectiveUser,
    serialize,
    selectedSchoolIds,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const payload = await request.validateUsing(listInquiriesValidator)
    const page = payload.page || 1
    const limit = Math.min(payload.limit || 20, 100)

    const query = ParentInquiry.query()
      .whereIn('schoolId', selectedSchoolIds || [])
      .preload('createdByResponsible')
      .preload('student', (sq) => sq.preload('user'))
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc').limit(1)
      })

    if (payload.status && payload.status !== 'ALL') {
      query.where('status', payload.status)
    }

    // If user is a recipient, show inquiries addressed to them
    query.whereHas('recipients', (rq) => {
      rq.where('userId', user.id)
    })

    const result = await query.orderBy('createdAt', 'desc').paginate(page, limit)
    const data = result.all()
    const metadata = result.getMeta()

    return response.ok(await serialize(ParentInquiryTransformer.paginate(data, metadata)))
  }
}
```

**Step 2: Create show controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'

export default class ShowInquiryController {
  async handle({
    response,
    auth,
    effectiveUser,
    params,
    serialize,
    selectedSchoolIds,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query()
      .where('id', inquiryId)
      .preload('createdByResponsible')
      .preload('student', (sq) => sq.preload('user'))
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
      })
      .preload('recipients', (rq) => rq.preload('user'))
      .first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(inquiry.schoolId)) {
      throw AppException.forbidden('Você não tem permissão para acessar esta pergunta')
    }

    // Verify user is a recipient
    const isRecipient = inquiry.recipients.some((r) => r.userId === user.id)
    if (!isRecipient) {
      throw AppException.forbidden('Você não é destinatário desta pergunta')
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
```

**Step 3: Create message controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryAttachment from '#models/parent_inquiry_attachment'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { createMessageValidator } from '#validators/parent_inquiry'
import type { AuthorType } from '#models/parent_inquiry_message'

export default class CreateInquiryMessageController {
  async handle({
    request,
    response,
    auth,
    effectiveUser,
    params,
    serialize,
    selectedSchoolIds,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query().where('id', inquiryId).preload('recipients').first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(inquiry.schoolId)) {
      throw AppException.forbidden('Você não tem permissão para responder esta pergunta')
    }

    // Verify user is a recipient and get their type
    const recipient = inquiry.recipients.find((r) => r.userId === user.id)
    if (!recipient) {
      throw AppException.forbidden('Você não é destinatário desta pergunta')
    }

    if (inquiry.status === 'RESOLVED' || inquiry.status === 'CLOSED') {
      throw AppException.badRequest('Esta pergunta já foi encerrada')
    }

    const payload = await request.validateUsing(createMessageValidator)

    const message = await db.transaction(async (trx) => {
      const created = await ParentInquiryMessage.create(
        {
          inquiryId: inquiry.id,
          authorId: user.id,
          authorType: recipient.userType as AuthorType,
          body: payload.body,
        },
        { client: trx }
      )

      if (payload.attachments && payload.attachments.length > 0) {
        await Promise.all(
          payload.attachments.map((att) =>
            ParentInquiryAttachment.create(
              {
                messageId: created.id,
                fileName: att.fileName,
                filePath: att.filePath,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              },
              { client: trx }
            )
          )
        )
      }

      return created
    })

    await inquiry.load('createdByResponsible')
    await inquiry.load('student', (sq) => sq.preload('user'))
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
```

**Step 4: Commit**

```bash
git add app/controllers/escola/list_inquiries_controller.ts app/controllers/escola/show_inquiry_controller.ts app/controllers/escola/create_inquiry_message_controller.ts
git commit -m "feat: add escola inquiry controllers"
```

---

## Task 17: Register API Routes

**Files:**

- Modify: `start/routes/api/responsavel.ts`
- Modify: `start/routes/api/index.ts` (or create new escola routes file)

**Step 1: Add responsavel routes**

Add to `start/routes/api/responsavel.ts`:

```typescript
// Add imports at top
const ListStudentInquiriesController = () =>
  import('#controllers/responsavel/list_student_inquiries_controller')
const CreateStudentInquiryController = () =>
  import('#controllers/responsavel/create_student_inquiry_controller')
const ShowInquiryController = () => import('#controllers/responsavel/show_inquiry_controller')
const CreateInquiryMessageController = () =>
  import('#controllers/responsavel/create_inquiry_message_controller')
const ResolveInquiryController = () => import('#controllers/responsavel/resolve_inquiry_controller')

// Add routes inside the responsavel group
router.get('/students/:studentId/inquiries', [ListStudentInquiriesController]).as('inquiries.list')
router
  .post('/students/:studentId/inquiries', [CreateStudentInquiryController])
  .as('inquiries.create')
router.get('/inquiries/:inquiryId', [ShowInquiryController]).as('inquiries.show')
router
  .post('/inquiries/:inquiryId/messages', [CreateInquiryMessageController])
  .as('inquiries.messages.create')
router.post('/inquiries/:inquiryId/resolve', [ResolveInquiryController]).as('inquiries.resolve')
```

**Step 2: Create escola inquiry routes file**

Create `start/routes/api/escola_inquiries.ts`:

```typescript
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ListInquiriesController = () => import('#controllers/escola/list_inquiries_controller')
const ShowInquiryController = () => import('#controllers/escola/show_inquiry_controller')
const CreateInquiryMessageController = () =>
  import('#controllers/escola/create_inquiry_message_controller')
const ResolveInquiryController = () => import('#controllers/escola/resolve_inquiry_controller')

export function registerEscolaInquiriesApiRoutes() {
  router
    .group(() => {
      router.get('/inquiries', [ListInquiriesController]).as('inquiries.list')
      router.get('/inquiries/:inquiryId', [ShowInquiryController]).as('inquiries.show')
      router
        .post('/inquiries/:inquiryId/messages', [CreateInquiryMessageController])
        .as('inquiries.messages.create')
      router
        .post('/inquiries/:inquiryId/resolve', [ResolveInquiryController])
        .as('inquiries.resolve')
    })
    .prefix('/escola')
    .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
    .as('escola.inquiries')
}
```

**Step 3: Register routes in index**

Add to `start/routes/api/index.ts`:

```typescript
import { registerEscolaInquiriesApiRoutes } from './escola_inquiries.js'

// In registerApiRoutes function:
registerEscolaInquiriesApiRoutes()
```

**Step 4: Commit**

```bash
git add start/routes/api/*.ts
git commit -m "feat: add inquiry API routes"
```

---

## Task 18: Create Page Controllers (Responsável)

**Files:**

- Create: `app/controllers/pages/responsavel/show_responsavel_perguntas_page_controller.ts`
- Create: `app/controllers/pages/responsavel/show_responsavel_pergunta_detail_page_controller.ts`

**Step 1: Create list page controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelPerguntasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/perguntas', {})
  }
}
```

**Step 2: Create detail page controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelPerguntaDetailPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/pergunta-detail', {})
  }
}
```

**Step 3: Commit**

```bash
git add app/controllers/pages/responsavel/show_responsavel_perguntas*.ts
git commit -m "feat: add responsavel perguntas page controllers"
```

---

## Task 19: Create Page Controllers (Escola)

**Files:**

- Create: `app/controllers/pages/escola/show_perguntas_page_controller.ts`
- Create: `app/controllers/pages/escola/show_pergunta_detail_page_controller.ts`

**Step 1: Create list page controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowPerguntasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/perguntas', {})
  }
}
```

**Step 2: Create detail page controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowPerguntaDetailPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pergunta-detail', {})
  }
}
```

**Step 3: Commit**

```bash
git add app/controllers/pages/escola/show_perguntas*.ts
git commit -m "feat: add escola perguntas page controllers"
```

---

## Task 20: Register Page Routes

**Files:**

- Modify: `start/routes/pages/responsavel.ts`
- Modify: `start/routes/pages/escola.ts`

**Step 1: Add responsavel routes**

```typescript
// Add imports
const ShowResponsavelPerguntasPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_perguntas_page_controller')
const ShowResponsavelPerguntaDetailPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_pergunta_detail_page_controller')

// Add routes
router.get('/perguntas', [ShowResponsavelPerguntasPageController]).as('perguntas')
router
  .get('/perguntas/:inquiryId', [ShowResponsavelPerguntaDetailPageController])
  .as('perguntas.show')
```

**Step 2: Add escola routes**

```typescript
// Add imports
const ShowPerguntasPageController = () =>
  import('#controllers/pages/escola/show_perguntas_page_controller')
const ShowPerguntaDetailPageController = () =>
  import('#controllers/pages/escola/show_pergunta_detail_page_controller')

// Add routes (after comunicados section)
router.get('/perguntas', [ShowPerguntasPageController]).as('perguntas')
router.get('/perguntas/:inquiryId', [ShowPerguntaDetailPageController]).as('perguntas.show')
```

**Step 3: Commit**

```bash
git add start/routes/pages/*.ts
git commit -m "feat: add perguntas page routes"
```

---

## Task 21: Create Frontend Page - Responsável List

**Files:**

- Create: `inertia/pages/responsavel/perguntas.tsx`

**Step 1: Create the page component**

(See full implementation in next message due to size)

**Step 2: Commit**

```bash
git add inertia/pages/responsavel/perguntas.tsx
git commit -m "feat: add responsavel perguntas list page"
```

---

## Task 22: Create Frontend Page - Responsável Detail

**Files:**

- Create: `inertia/pages/responsavel/pergunta-detail.tsx`

**Step 1: Create the page component**

(See full implementation in next message due to size)

**Step 2: Commit**

```bash
git add inertia/pages/responsavel/pergunta-detail.tsx
git commit -m "feat: add responsavel pergunta detail page"
```

---

## Task 23: Create Frontend Page - Escola List

**Files:**

- Create: `inertia/pages/escola/perguntas.tsx`

**Step 1: Create the page component**

**Step 2: Commit**

```bash
git add inertia/pages/escola/perguntas.tsx
git commit -m "feat: add escola perguntas list page"
```

---

## Task 24: Create Frontend Page - Escola Detail

**Files:**

- Create: `inertia/pages/escola/pergunta-detail.tsx`

**Step 1: Create the page component**

**Step 2: Commit**

```bash
git add inertia/pages/escola/pergunta-detail.tsx
git commit -m "feat: add escola pergunta detail page"
```

---

## Task 25: Add Navigation Items

**Files:**

- Modify: `inertia/components/layouts/responsavel-layout.tsx`
- Modify: `inertia/components/layouts/escola-layout.tsx` (or equivalent)

**Step 1: Add to responsavel navigation**

```typescript
// Add to baseNavigation array
{
  title: 'Perguntas',
  route: 'web.responsavel.perguntas',
  href: '/responsavel/perguntas',
  icon: MessageCircleQuestion,
},
```

**Step 2: Add to escola navigation**

**Step 3: Commit**

```bash
git add inertia/components/layouts/*.tsx
git commit -m "feat: add perguntas to navigation"
```

---

## Task 26: Add Notification Types

**Files:**

- Modify: `app/models/notification.ts`
- Create migration if needed

**Step 1: Add new notification types**

```typescript
export type NotificationType =
  | // ... existing types
  | 'INQUIRY_CREATED'
  | 'INQUIRY_MESSAGE'
  | 'INQUIRY_RESOLVED'
```

**Step 2: Create migration for new types**

**Step 3: Commit**

```bash
git add app/models/notification.ts database/migrations/*
git commit -m "feat: add inquiry notification types"
```

---

## Task 27: Create Notification Service

**Files:**

- Create: `app/services/inquiries/inquiry_notification_service.ts`

**Step 1: Create notification service**

**Step 2: Integrate with controllers**

**Step 3: Commit**

---

## Task 28: Write Tests

**Files:**

- Create: `tests/functional/responsavel/inquiries_api.spec.ts`
- Create: `tests/functional/escola/inquiries_api.spec.ts`

**Step 1: Write responsavel API tests**

**Step 2: Write escola API tests**

**Step 3: Run tests**

Run: `node ace test --files="tests/functional/responsavel/inquiries_api.spec.ts"`

**Step 4: Commit**

```bash
git add tests/functional/**/*.spec.ts
git commit -m "test: add inquiry API tests"
```

---

## Task 29: Final Verification

**Step 1: Run all tests**

Run: `node ace test`

**Step 2: Run linting**

Run: `npm run lint`

**Step 3: Run type checking**

Run: `npm run typecheck`

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete parent inquiry feature"
```
